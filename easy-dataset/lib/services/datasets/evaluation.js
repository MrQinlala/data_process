/**
 * 数据集评估核心服务
 * 从现有的评估接口中抽离核心逻辑，供单个评估和批量评估复用
 */

import { getDatasetsById, updateDatasetEvaluation } from '@/lib/db/datasets';
import { getChunkById } from '@/lib/db/chunks';
import LLMClient from '@/lib/llm/core/index';
import { getDatasetEvaluationPrompt } from '@/lib/llm/prompts/datasetEvaluation';
import { extractJsonFromLLMOutput } from '@/lib/llm/common/util';

/**
 * 评估单个数据集
 * @param {string} projectId - 项目ID
 * @param {string} datasetId - 数据集ID
 * @param {object} model - 模型配置
 * @param {string} language - 语言
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function evaluateDataset(projectId, datasetId, model, language = 'zh-CN') {
  try {
    // 1. 获取数据集信息
    const dataset = await getDatasetsById(datasetId);
    if (!dataset) {
      throw new Error('数据集不存在');
    }

    if (dataset.projectId !== projectId) {
      throw new Error('数据集不属于指定项目');
    }

    // 2. 根据 questionId 获取原始文本块内容
    let chunkContent = dataset.chunkContent || '';

    // 如果数据集中没有 chunkContent，尝试通过 questionId 查找
    if (!chunkContent && dataset.questionId) {
      try {
        // 查找对应的问题，然后获取 chunk 内容
        const { getQuestionById } = await import('@/lib/db/questions');
        const question = await getQuestionById(dataset.questionId);
        if (question && question.chunkId) {
          const chunk = await getChunkById(question.chunkId);
          if (chunk) {
            // 检查是否是蒸馏内容
            if (chunk.name === 'Distilled Content') {
              chunkContent = 'Distilled Content - 没有原始文本参考';
            } else {
              chunkContent = chunk.content;
            }
          }
        }
      } catch (error) {
        console.warn('无法获取原始文本块内容:', error.message);
        chunkContent = dataset.chunkContent || '';
      }
    }

    // 检查是否是蒸馏内容
    if (dataset.chunkName === 'Distilled Content' || chunkContent.includes('Distilled Content')) {
      chunkContent = 'Distilled Content - 没有原始文本参考';
    }

    // 3. 生成评估提示词
    const prompt = await getDatasetEvaluationPrompt(
      language,
      {
        chunkContent,
        question: dataset.question,
        answer: dataset.answer
      },
      projectId
    );

    // 4. 调用LLM进行评估
    const llmClient = new LLMClient(model);
    const { answer } = await llmClient.getResponseWithCOT(prompt);

    // 5. 解析评估结果
    let evaluationResult;
    try {
      evaluationResult = extractJsonFromLLMOutput(answer);

      if (!evaluationResult || typeof evaluationResult.score !== 'number' || !evaluationResult.evaluation) {
        throw new Error('评估结果格式错误');
      }

      // 验证评分范围
      if (evaluationResult.score < 0 || evaluationResult.score > 5) {
        evaluationResult.score = Math.max(0, Math.min(5, evaluationResult.score));
      }

      // 确保评分精确到 0.5
      evaluationResult.score = Math.round(evaluationResult.score * 2) / 2;
    } catch (error) {
      console.error('解析评估结果失败:', error);
      throw new Error('AI评估结果解析失败，请重试');
    }

    // 6. 更新数据集评估结果
    await updateDatasetEvaluation(datasetId, evaluationResult.score, evaluationResult.evaluation);

    return {
      success: true,
      data: {
        score: evaluationResult.score,
        aiEvaluation: evaluationResult.evaluation
      }
    };
  } catch (error) {
    console.error('数据集评估失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 批量评估数据集
 * @param {string} projectId - 项目ID
 * @param {Array<string>} datasetIds - 数据集ID数组
 * @param {object} model - 模型配置
 * @param {string} language - 语言
 * @param {Function} onProgress - 进度回调函数 (current, total) => void
 * @returns {Promise<{success: number, failed: number, results: Array}>}
 */
export async function batchEvaluateDatasets(projectId, datasetIds, model, language = 'zh-CN', onProgress = null) {
  const results = [];
  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < datasetIds.length; i++) {
    const datasetId = datasetIds[i];

    try {
      const result = await evaluateDataset(projectId, datasetId, model, language);

      if (result.success) {
        successCount++;
        results.push({
          datasetId,
          success: true,
          ...result.data
        });
      } else {
        failedCount++;
        results.push({
          datasetId,
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      failedCount++;
      results.push({
        datasetId,
        success: false,
        error: error.message
      });
    }

    // 调用进度回调
    if (onProgress) {
      onProgress(i + 1, datasetIds.length);
    }

    // 添加小延迟避免过于频繁的API调用
    if (i < datasetIds.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return {
    success: successCount,
    failed: failedCount,
    results
  };
}
