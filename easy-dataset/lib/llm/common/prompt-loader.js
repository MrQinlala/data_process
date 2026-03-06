import { getCustomPrompt } from '@/lib/db/custom-prompts';

/**
 * 获取提示词内容，优先使用项目自定义的，否则使用默认的
 * @param {string} projectId 项目ID
 * @param {string} promptType 提示词类型 (如: question, answer等)
 * @param {string} promptKey 提示词键名 (如: QUESTION_PROMPT, QUESTION_PROMPT_EN等)
 * @param {string} language 语言 (zh-CN, en)
 * @param {string} defaultContent 默认提示词内容
 * @returns {Promise<string>} 提示词内容
 */
export async function getPromptContent(projectId, promptType, promptKey, language, defaultContent) {
  try {
    if (!projectId) {
      return defaultContent;
    }

    const customPrompt = await getCustomPrompt(projectId, promptType, promptKey, language);

    if (customPrompt && customPrompt.isActive && customPrompt.content) {
      return customPrompt.content;
    }

    return defaultContent;
  } catch (error) {
    console.error('获取提示词内容失败:', error);
    return defaultContent;
  }
}

/**
 * 根据语言获取对应的提示词键名
 * @param {string} language 语言
 * @param {string} baseKey 基础键名
 * @returns {string} 完整的提示词键名
 */
export function getPromptKey(language, baseKey) {
  if (language === 'en') {
    return `${baseKey}_EN`;
  }
  if (language === 'tr') {
    return `${baseKey}_TR`;
  }
  return baseKey;
}

/**
 * 根据提示词键名获取对应的语言
 * @param {string} promptKey 提示词键名
 * @returns {string} 语言
 */
export function getLanguageFromKey(promptKey) {
  if (promptKey.endsWith('_EN')) {
    return 'en';
  }
  if (promptKey.endsWith('_TR')) {
    return 'tr';
  }
  return 'zh-CN';
}

/**
 * 通用的提示词处理函数，减少模板代码
 * @param {string} language - 语言标识
 * @param {string} promptType - 提示词类型 (如: dataClean, label, optimizeCot等)
 * @param {string} baseKey - 基础键名 (如: DATA_CLEAN_PROMPT)
 * @param {Object} defaultPrompts - 默认提示词对象 {zh: 中文提示词, en: 英文提示词}
 * @param {Object} params - 参数替换对象
 * @param {string} projectId - 项目ID
 * @returns {Promise<string>} - 处理后的提示词
 */
export async function processPrompt(language, promptType, baseKey, defaultPrompts, params = {}, projectId = null) {
  const promptKey = getPromptKey(language, baseKey);
  let defaultPrompt;
  if (language === 'en') {
    defaultPrompt = defaultPrompts.en;
  } else if (language === 'tr') {
    defaultPrompt = defaultPrompts.tr;
  } else {
    defaultPrompt = defaultPrompts.zh;
  }
  const langCode = getLanguageFromKey(promptKey);

  let prompt = defaultPrompt;

  if (projectId) {
    try {
      prompt = await getPromptContent(projectId, promptType, promptKey, langCode, defaultPrompt);
    } catch (error) {
      console.error('获取自定义提示词失败，使用默认提示词:', error);
      prompt = defaultPrompt;
    }
  }

  // 参数替换
  let result = prompt;
  for (const [key, value] of Object.entries(params)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}
