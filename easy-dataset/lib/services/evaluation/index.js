/**
 * 模型评估服务
 * 提供单题评估、答案匹配、LLM 评分等核心功能
 */

import LLMClient from '@/lib/llm/core/index';
import { buildAnswerPrompt } from '@/lib/llm/prompts/modelEvaluation';
import { buildJudgePrompt } from '@/lib/llm/prompts/llmJudge';

// 答题状态常量
export const EVAL_STATUS = {
  SUCCESS: 0, // 成功
  FORMAT_ERROR: 1, // 输出格式不符合规范
  API_ERROR: 2 // LLM 调用报错
};

/**
 * 评估单个题目
 * @param {Object} params - 评估参数
 * @param {Object} params.evalDataset - 评估题目数据
 * @param {Object} params.testModelConfig - 测试模型配置
 * @param {Object} params.judgeModelConfig - 教师模型配置（可选，主观题需要）
 * @param {string} params.projectId - 项目ID
 * @param {string} params.language - 语言
 * @param {Array} params.customScoreAnchors - 自定义评分规则（可选）
 * @returns {Promise<Object>} - 评估结果 { modelAnswer, score, isCorrect, judgeResponse, duration, status, errorMessage }
 */
export async function evaluateSingleQuestion({
  evalDataset,
  testModelConfig,
  judgeModelConfig,
  projectId,
  language = 'zh-CN',
  customScoreAnchors = null
}) {
  const startTime = Date.now();
  let modelAnswer = '';
  let status = EVAL_STATUS.SUCCESS;
  let errorMessage = '';

  // 创建测试模型客户端
  const testLLMClient = new LLMClient({
    projectId,
    providerId: testModelConfig.providerId,
    modelName: testModelConfig.modelId,
    apiKey: testModelConfig.apiKey,
    endpoint: testModelConfig.endpoint
  });

  try {
    // 获取模型回答
    modelAnswer = await getModelAnswer(testLLMClient, evalDataset, language);
  } catch (error) {
    // LLM 调用报错
    status = EVAL_STATUS.API_ERROR;
    errorMessage = error.message || 'LLM API Error';
    const duration = Date.now() - startTime;

    return {
      modelAnswer: '',
      score: 0,
      isCorrect: false,
      judgeResponse: '',
      duration,
      status,
      errorMessage
    };
  }

  // 评估答案
  let judgeClient = null;
  if (judgeModelConfig && needsLLMJudge(evalDataset.questionType)) {
    judgeClient = new LLMClient({
      projectId,
      providerId: judgeModelConfig.providerId,
      modelName: judgeModelConfig.modelId,
      apiKey: judgeModelConfig.apiKey,
      endpoint: judgeModelConfig.endpoint
    });
  }

  const result = await evaluateAnswer(evalDataset, modelAnswer, judgeClient, language, customScoreAnchors);

  // 检查是否是格式错误（对于客观题，如果无法匹配答案可能是格式问题）
  if (!result.isCorrect && isFormatError(evalDataset.questionType, modelAnswer)) {
    status = EVAL_STATUS.FORMAT_ERROR;
    errorMessage = '模型输出格式不符合规范';
  }

  const duration = Date.now() - startTime;

  return {
    modelAnswer,
    ...result,
    duration,
    status,
    errorMessage
  };
}

/**
 * 检查是否是格式错误
 */
function isFormatError(questionType, modelAnswer) {
  if (!modelAnswer || modelAnswer.trim() === '') return true;

  const answer = modelAnswer.trim();

  switch (questionType) {
    case 'true_false':
      // 判断题应该输出 ✅ 或 ❌
      return answer !== '✅' && answer !== '❌';

    case 'single_choice':
      // 单选题应该输出单个字母
      return !/^[A-Za-z]$/.test(answer.charAt(0));

    case 'multiple_choice':
      // 多选题应该输出多个字母
      return !/^[A-Za-z]+$/.test(answer.replace(/[^A-Za-z]/g, ''));

    default:
      return false;
  }
}

/**
 * 检查题型是否需要 LLM 评分
 */
export function needsLLMJudge(questionType) {
  return questionType === 'short_answer' || questionType === 'open_ended';
}

/**
 * 获取模型对题目的回答
 */
async function getModelAnswer(llmClient, evalDataset, language) {
  const { question, questionType, options } = evalDataset;

  // 构建选项文本
  let optionsText = '';
  if (options && (questionType === 'single_choice' || questionType === 'multiple_choice')) {
    try {
      const optionsArray = JSON.parse(options);
      optionsText = optionsArray.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n');
    } catch (e) {
      optionsText = options;
    }
  }

  // 构建提示词
  const prompt = await buildAnswerPrompt(questionType, question, optionsText, language);

  const { answer } = await llmClient.getResponseWithCOT(prompt);
  return answer;
}

/**
 * 评估模型答案
 */
async function evaluateAnswer(evalDataset, modelAnswer, judgeLLMClient, language, customScoreAnchors = null) {
  const { questionType, correctAnswer } = evalDataset;

  switch (questionType) {
    case 'true_false':
      return evaluateTrueFalse(modelAnswer, correctAnswer);

    case 'single_choice':
      return evaluateSingleChoice(modelAnswer, correctAnswer);

    case 'multiple_choice':
      return evaluateMultipleChoice(modelAnswer, correctAnswer);

    case 'short_answer':
    case 'open_ended':
      if (!judgeLLMClient) {
        return {
          score: 0,
          isCorrect: false,
          judgeResponse: '缺少教师模型，无法评分'
        };
      }
      return await evaluateWithLLM(
        judgeLLMClient,
        evalDataset,
        modelAnswer,
        questionType,
        language,
        customScoreAnchors
      );

    default:
      return { score: 0, isCorrect: false, judgeResponse: '未知题型' };
  }
}

/**
 * 评估判断题
 */
function evaluateTrueFalse(modelAnswer, correctAnswer) {
  // 根据 TRUE_FALSE_ANSWER_PROMPT，模型应该仅输出 ✅ 或 ❌
  // 直接检查这两个 emoji
  const modelTrimmed = modelAnswer.trim();
  const correctTrimmed = correctAnswer.trim();

  console.log('modelTrimmed:', modelTrimmed);
  console.log('correctTrimmed:', correctTrimmed);

  const isCorrect = modelTrimmed === correctTrimmed && (modelTrimmed === '✅' || modelTrimmed === '❌');

  return {
    score: isCorrect ? 1 : 0,
    isCorrect,
    judgeResponse: ''
  };
}

/**
 * 评估单选题
 */
function evaluateSingleChoice(modelAnswer, correctAnswer) {
  const modelLetter = extractLetters(modelAnswer);
  const correctLetter = extractLetters(correctAnswer);

  const isCorrect = modelLetter.charAt(0) === correctLetter.charAt(0);

  return {
    score: isCorrect ? 1 : 0,
    isCorrect,
    judgeResponse: ''
  };
}

/**
 * 评估多选题
 */
function evaluateMultipleChoice(modelAnswer, correctAnswer) {
  const modelLetters = extractLetters(modelAnswer).split('').sort().join('');
  const correctLetters = extractLetters(correctAnswer).split('').sort().join('');

  const isCorrect = modelLetters === correctLetters;

  return {
    score: isCorrect ? 1 : 0,
    isCorrect,
    judgeResponse: ''
  };
}

/**
 * 使用 LLM 评估主观题
 */
async function evaluateWithLLM(
  judgeLLMClient,
  evalDataset,
  modelAnswer,
  questionType,
  language,
  customScoreAnchors = null
) {
  const { question, correctAnswer } = evalDataset;

  // 构建评估提示词（简答题和开放题使用不同的评估标准，支持自定义评分规则）
  const prompt = await buildJudgePrompt(
    questionType,
    question,
    correctAnswer,
    modelAnswer,
    language,
    customScoreAnchors
  );

  try {
    const { answer } = await judgeLLMClient.getResponseWithCOT(prompt);
    return parseJudgeResponse(answer);
  } catch (error) {
    console.error('LLM 评分失败:', error);
    return {
      score: 0,
      isCorrect: false,
      judgeResponse: `评分失败: ${error.message}`
    };
  }
}

/**
 * 解析评分响应
 */
function parseJudgeResponse(responseText) {
  // 尝试提取 JSON
  const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const score = Math.max(0, Math.min(1, parseFloat(parsed.score) || 0));
      return {
        score,
        isCorrect: score >= 0.6,
        judgeResponse: responseText
      };
    } catch (e) {
      // JSON 解析失败，继续尝试其他方式
    }
  }

  // 尝试从文本中提取分数
  const scoreMatch = responseText.match(/(\d+\.?\d*)/);
  if (scoreMatch) {
    let score = parseFloat(scoreMatch[1]);
    if (score > 1) score = score / 100;
    score = Math.max(0, Math.min(1, score));
    return {
      score,
      isCorrect: score >= 0.6,
      judgeResponse: responseText
    };
  }

  return {
    score: 0,
    isCorrect: false,
    judgeResponse: `无法解析评分结果: ${responseText}`
  };
}

/**
 * 标准化文本
 */
function normalizeText(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * 提取字母（用于选择题）
 */
function extractLetters(answer) {
  return String(answer || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

export default {
  evaluateSingleQuestion,
  needsLLMJudge
};
