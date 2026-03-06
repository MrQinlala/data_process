/**
 * 领域树处理模块
 * 用于处理领域树的生成、修订和管理
 */
import LLMClient from '../llm/core/index';
import { getProjectTocs } from '../file/text-splitter';
import { getTags, batchSaveTags } from '../db/tags';
import { extractJsonFromLLMOutput } from '../llm/common/util';
import { filterDomainTree } from './file';
import { getLabelPrompt } from '../llm/prompts/label';
import { getLabelRevisePrompt } from '../llm/prompts/labelRevise';

/**
 * 处理领域树生成或更新
 * @param {Object} options - 配置选项
 * @param {string} options.projectId - 项目ID
 * @param {string} options.action - 操作类型: 'rebuild', 'revise', 'keep'
 * @param {string} options.toc - 所有文档的目录结构
 * @param {Object} options.model - 使用的模型信息
 * @param {string} options.language - 语言: 'en' 或 '中文'
 * @param {string} options.fileName - 文件名（用于新增文件时获取内容）
 * @param {string} options.deletedContent - 被删除的文件内容（用于删除文件时）
 * @param {Object} options.project - 项目信息，包含 globalPrompt 和 domainTreePrompt
 * @returns {Promise<Array>} 生成的领域树标签
 */
export async function handleDomainTree({
  projectId,
  action = 'rebuild',
  allToc,
  newToc,
  model,
  language = '中文',
  deleteToc = null,
  project
}) {
  // 如果是保持不变，直接返回现有标签
  if (action === 'keep') {
    console.log(`[${projectId}] Using existing domain tree`);
    return await getTags(projectId);
  }

  try {
    if (!allToc) {
      allToc = await getProjectTocs(projectId);
    }

    const llmClient = new LLMClient(model);
    let tags, prompt, response;
    // 重建领域树
    if (action === 'rebuild') {
      console.log(`[${projectId}] Rebuilding domain tree`);
      prompt = await getLabelPrompt(language, { text: allToc.slice(0, 100000) }, projectId);
      response = await llmClient.getResponse(prompt);
      tags = extractJsonFromLLMOutput(response);
      console.log('rebuild tags', tags);
    }
    // 修订领域树
    else if (action === 'revise') {
      console.log(`[${projectId}] Revising domain tree`);
      // 获取现有的领域树
      const existingTags = await getTags(projectId);

      if (!existingTags || existingTags.length === 0) {
        // 如果没有现有领域树，就像重建一样处理
        prompt = await getLabelPrompt(language, { text: allToc.slice(0, 100000) }, projectId);
      } else {
        // 增量更新领域树的逻辑

        prompt = await getLabelRevisePrompt(
          language,
          {
            text: allToc,
            existingTags: filterDomainTree(existingTags),
            newContent: newToc,
            deletedContent: deleteToc
          },
          projectId
        );
      }

      // console.log('revise', prompt);

      response = await llmClient.getResponse(prompt);
      tags = extractJsonFromLLMOutput(response);

      // console.log('revise tags', tags);
    }

    // 保存领域树标签（如果生成成功）
    if (tags && tags.length > 0 && action !== 'keep') {
      await batchSaveTags(projectId, tags);
    } else if (!tags && action !== 'keep') {
      console.error(`[${projectId}] Failed to generate domain tree tags`);
    }

    return tags;
  } catch (error) {
    console.error(`[${projectId}] Error handling domain tree: ${error.message}`);
    throw error;
  }
}
