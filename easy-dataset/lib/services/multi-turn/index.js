/**
 * 多轮对话数据集生成核心服务
 */

import { getQuestionById } from '@/lib/db/questions';
import { getChunkById } from '@/lib/db/chunks';
import { createDatasetConversation } from '@/lib/db/dataset-conversations';
import LLMClient from '@/lib/llm/core/index';
import { getAssistantReplyPrompt, getNextQuestionPrompt } from '@/lib/llm/prompts/multiTurnConversation';
import { extractJsonFromLLMOutput } from '@/lib/llm/common/util';
import { nanoid } from 'nanoid';

/**
 * 生成多轮对话数据集
 * @param {string} projectId - 项目ID
 * @param {string} questionId - 问题ID
 * @param {object} config - 多轮对话配置
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function generateMultiTurnConversation(projectId, questionId, config) {
  try {
    const {
      systemPrompt = '',
      scenario = '',
      rounds = 3,
      roleA = '用户',
      roleB = '助手',
      model,
      language = '中文'
    } = config;

    // 1. 获取问题信息
    const question = await getQuestionById(questionId);
    if (!question) {
      throw new Error('问题不存在');
    }

    if (question.projectId !== projectId) {
      throw new Error('问题不属于指定项目');
    }

    // 2. 获取文本块内容
    const chunk = await getChunkById(question.chunkId);
    if (!chunk) {
      throw new Error('文本块不存在');
    }

    // 3. 初始化对话消息数组
    const messages = [];

    // 添加系统提示词（如果有）
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // 4. 创建LLM客户端
    const llmClient = new LLMClient(model);

    // 5. 生成多轮对话
    let currentRound = 0;
    let userMessage = question.question; // 第一轮用户问题

    while (currentRound < rounds) {
      // 添加用户消息
      messages.push({
        role: 'user',
        content: userMessage
      });

      // 生成助手回复
      const conversationHistory = messages.slice(); // 复制当前对话历史
      const assistantResponse = await generateAssistantResponse(
        llmClient,
        conversationHistory,
        chunk.content,
        scenario,
        roleA,
        roleB,
        currentRound + 1,
        rounds,
        projectId,
        language
      );

      // 添加助手消息
      messages.push({
        role: 'assistant',
        content: assistantResponse
      });

      currentRound++;

      // 如果还需要更多轮对话，生成下一轮用户问题
      if (currentRound < rounds) {
        const nextUserMessage = await generateNextUserMessage(
          llmClient,
          messages.slice(),
          chunk.content,
          scenario,
          roleA,
          roleB,
          currentRound + 1,
          rounds,
          projectId,
          language
        );
        userMessage = nextUserMessage;
      }
    }

    // 6. 保存到数据库
    const conversationData = {
      id: nanoid(),
      projectId,
      questionId,
      question: question.question,
      chunkId: question.chunkId,
      model: typeof model === 'string' ? model : model.modelName || 'unknown',
      questionLabel: question.label || '',
      scenario,
      roleA,
      roleB,
      turnCount: currentRound,
      maxTurns: rounds,
      rawMessages: JSON.stringify(messages),
      confirmed: false,
      score: 0,
      aiEvaluation: '',
      tags: '',
      note: `基于问题 "${question.question}" 生成的多轮对话`
    };

    const result = await createDatasetConversation(conversationData);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('生成多轮对话失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 生成助手回复
 */
async function generateAssistantResponse(
  llmClient,
  conversationHistory,
  chunkContent,
  scenario,
  roleA,
  roleB,
  currentRound,
  totalRounds,
  projectId,
  language
) {
  const prompt = await getAssistantReplyPrompt(
    language,
    {
      scenario,
      roleA,
      roleB,
      chunkContent,
      conversationHistory: formatConversationHistory(conversationHistory, roleA, roleB),
      currentRound,
      totalRounds
    },
    projectId
  );

  const response = await llmClient.getResponse(prompt);

  // 使用项目标准的JSON解析函数
  const assistantReply = extractJsonFromLLMOutput(response);

  if (assistantReply && assistantReply.content) {
    return assistantReply.content;
  } else {
    console.warn('助手回复JSON解析失败，使用原始响应:', response);
    return response.trim();
  }
}

/**
 * 生成下一轮用户问题
 */
async function generateNextUserMessage(
  llmClient,
  conversationHistory,
  chunkContent,
  scenario,
  roleA,
  roleB,
  nextRound,
  totalRounds,
  projectId,
  language
) {
  const prompt = await getNextQuestionPrompt(
    language,
    {
      scenario,
      roleA,
      roleB,
      chunkContent,
      conversationHistory: formatConversationHistory(conversationHistory, roleA, roleB),
      nextRound,
      totalRounds
    },
    projectId
  );

  const response = await llmClient.getResponse(prompt);

  // 使用项目标准的JSON解析函数
  const nextQuestion = extractJsonFromLLMOutput(response);

  if (nextQuestion && nextQuestion.question) {
    return nextQuestion.question;
  } else {
    console.warn('下一轮问题JSON解析失败，使用原始响应:', response);
    return response.trim();
  }
}

/**
 * 格式化对话历史
 */
function formatConversationHistory(messages, roleA, roleB) {
  return messages
    .filter(msg => msg.role !== 'system')
    .map(msg => {
      const roleName = msg.role === 'user' ? roleA : roleB;
      return `${roleName}: ${msg.content}`;
    })
    .join('\n\n');
}

/**
 * 批量生成多轮对话数据集
 * @param {string} projectId - 项目ID
 * @param {Array} questionIds - 问题ID数组
 * @param {object} config - 配置
 * @param {Function} progressCallback - 进度回调
 * @returns {Promise<{success: number, failed: number, results: Array}>}
 */
export async function batchGenerateMultiTurnConversations(projectId, questionIds, config, progressCallback) {
  const results = [];
  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < questionIds.length; i++) {
    const questionId = questionIds[i];

    try {
      const result = await generateMultiTurnConversation(projectId, questionId, config);

      if (result.success) {
        successCount++;
        results.push({
          questionId,
          success: true,
          data: result.data
        });
      } else {
        failedCount++;
        results.push({
          questionId,
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error(`生成多轮对话失败 ${questionId}:`, error);
      failedCount++;
      results.push({
        questionId,
        success: false,
        error: error.message
      });
    }

    // 调用进度回调
    if (progressCallback) {
      await progressCallback(i + 1, questionIds.length);
    }

    // 添加小延迟避免API限流
    if (i < questionIds.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return {
    success: successCount,
    failed: failedCount,
    results
  };
}
