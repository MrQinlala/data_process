import LLMClient from '@/lib/llm/core/index';
import { getEvalQuestionPrompt } from '@/lib/llm/prompts/evalQuestion';
import { extractJsonFromLLMOutput } from '@/lib/llm/common/util';
import { getChunkById } from '@/lib/db/chunks';
import { getTaskConfig } from '@/lib/db/projects';
import { createEvalQuestion } from '@/lib/db/evalDatasets';
import logger from '@/lib/util/logger';

/**
 * 计算各题型应该生成的数量
 * 使用加权随机抽样算法，每次根据比例权重随机选择一个题型
 * @param {number} textLength - 文本长度
 * @param {number} questionGenerationLength - 每多少字生成一个问题（从配置中获取）
 * @param {Object} ratios - 各题型比例配置
 * @returns {Object} - 各题型的生成数量
 */
function calculateQuestionCounts(textLength, questionGenerationLength, ratios) {
  // 计算总题目数
  const totalQuestions = Math.floor(textLength / questionGenerationLength);

  // 计算比例总和
  const totalRatio = Object.values(ratios).reduce((sum, ratio) => sum + ratio, 0);

  // 如果所有比例都是0或总题目数为0，返回空对象
  if (totalRatio === 0 || totalQuestions === 0) {
    return {};
  }

  const questionTypes = ['true_false', 'single_choice', 'multiple_choice', 'short_answer', 'open_ended'];

  // 过滤出比例大于0的题型
  const activeTypes = questionTypes.filter(type => ratios[type] > 0);

  if (activeTypes.length === 0) {
    return {};
  }

  // 初始化计数器
  const counts = {};
  activeTypes.forEach(type => {
    counts[type] = 0;
  });

  // 循环 totalQuestions 次，每次根据权重随机选择一个题型
  for (let i = 0; i < totalQuestions; i++) {
    // 生成 0 到 totalRatio 之间的随机数
    const random = Math.random() * totalRatio;

    // 根据累积权重确定选中的题型
    let cumulative = 0;
    for (const type of activeTypes) {
      cumulative += ratios[type];
      if (random < cumulative) {
        counts[type]++;
        break;
      }
    }
  }

  // 过滤掉数量为0的题型
  const result = {};
  Object.keys(counts).forEach(type => {
    if (counts[type] > 0) {
      result[type] = counts[type];
    }
  });

  return result;
}

/**
 * 为单个文本块生成测评题目
 * @param {string} projectId - 项目ID
 * @param {string} chunkId - 文本块ID
 * @param {Object} options - 生成选项
 * @param {Object} options.model - 模型配置
 * @param {string} options.language - 语言（'zh-CN' 或 'en'）
 * @param {boolean} options.debug - 是否开启调试模式
 * @returns {Promise<Object>} - 生成结果
 */
export async function generateEvalQuestionsForChunk(projectId, chunkId, options) {
  const { model, language = 'zh-CN' } = options;

  try {
    // 获取文本块内容
    const chunk = await getChunkById(chunkId);
    if (!chunk) {
      throw new Error(`Chunk not found: ${chunkId}`);
    }

    // 获取项目配置
    const taskConfig = await getTaskConfig(projectId);
    const { questionGenerationLength = 240, evalQuestionTypeRatios } = taskConfig;

    // 如果没有配置比例，使用默认值
    const ratios = evalQuestionTypeRatios || {
      true_false: 0,
      single_choice: 1,
      multiple_choice: 0,
      short_answer: 0,
      open_ended: 0
    };

    // 计算各题型数量
    const questionCounts = calculateQuestionCounts(chunk.content.length, questionGenerationLength, ratios);

    logger.info('Generating eval questions:', questionCounts);

    // 如果没有需要生成的题目，直接返回
    if (Object.keys(questionCounts).length === 0) {
      return {
        chunkId,
        questions: [],
        total: 0,
        message: 'No question types configured'
      };
    }

    // 创建LLM客户端
    const llmClient = new LLMClient(model);

    // 为每个题型生成题目
    const allQuestions = [];
    const questionTypes = Object.keys(questionCounts);

    for (const questionType of questionTypes) {
      const count = questionCounts[questionType];
      if (count <= 0) continue;

      try {
        // 获取对应题型的提示词
        const prompt = await getEvalQuestionPrompt(
          language,
          questionType,
          {
            text: chunk.content,
            number: count
          },
          projectId
        );

        // 调用LLM生成题目
        const { answer } = await llmClient.getResponseWithCOT(prompt);

        // 使用项目标准的JSON解析函数
        const questions = extractJsonFromLLMOutput(answer);

        // 为每个题目添加类型标识
        questions.forEach(q => {
          q.questionType = questionType;
        });

        allQuestions.push(...questions);

        logger.info(`Generated ${questions.length} questions for type ${questionType}`);
      } catch (error) {
        logger.error(`Failed to generate questions for type ${questionType}:`, error);
        // 继续处理其他题型
      }
    }

    // 保存到数据库（在服务层处理数据转换）
    const savedQuestions = [];
    for (const question of allQuestions) {
      const saved = await createEvalQuestion({
        projectId,
        chunkId,
        question: question.question,
        questionType: question.questionType,
        options: question.options ? JSON.stringify(question.options) : '',
        correctAnswer: Array.isArray(question.correctAnswer)
          ? JSON.stringify(question.correctAnswer)
          : String(question.correctAnswer || ''),
        tags: question.tags || '',
        note: question.note || ''
      });
      savedQuestions.push(saved);
    }

    return {
      chunkId,
      questions: savedQuestions,
      total: savedQuestions.length,
      breakdown: questionCounts
    };
  } catch (error) {
    logger.error('Error generating eval questions:', error);
    throw error;
  }
}
