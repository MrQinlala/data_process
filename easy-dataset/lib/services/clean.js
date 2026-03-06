import LLMClient from '@/lib/llm/core/index';
import { getDataCleanPrompt } from '@/lib/llm/prompts/dataClean';
import { getTaskConfig, getProject } from '@/lib/db/projects';
import { getChunkById, updateChunkContent } from '@/lib/db/chunks';
import logger from '@/lib/util/logger';

/**
 * 为指定文本块进行数据清洗
 * @param {String} projectId 项目ID
 * @param {String} chunkId 文本块ID
 * @param {Object} options 选项
 * @param {String} options.model 模型名称
 * @param {String} options.language 语言(中文/en)
 * @returns {Promise<Object>} 清洗结果
 */
export async function cleanDataForChunk(projectId, chunkId, options) {
  try {
    const { model, language = '中文' } = options;

    if (!model) {
      throw new Error('模型名称不能为空');
    }

    // 并行获取文本块内容和项目配置
    const chunk = await getChunkById(chunkId);

    if (!chunk) {
      throw new Error('文本块不存在');
    }

    // 创建LLM客户端
    const llmClient = new LLMClient(model);

    // 获取提示词
    const prompt = await getDataCleanPrompt(language, { text: chunk.content }, projectId);

    const { answer: response } = await llmClient.getResponseWithCOT(prompt);

    // 直接使用LLM返回的清洗后文本
    const cleanedContent = response.trim();

    if (!cleanedContent) {
      throw new Error('数据清洗失败：返回内容为空');
    }

    // 更新文本块内容
    await updateChunkContent(chunkId, cleanedContent);

    // 返回清洗结果
    return {
      chunkId,
      originalLength: chunk.content.length,
      cleanedLength: cleanedContent.length,
      cleanedContent,
      success: true
    };
  } catch (error) {
    logger.error('数据清洗时出错:', error);
    throw error;
  }
}

export default {
  cleanDataForChunk
};
