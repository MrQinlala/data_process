import { processPrompt } from '../common/prompt-loader';
import { getQuestionTemplate } from '../common/question-template';

// 原始问题就是默认提示词，templatePrompt、outputFormatPrompt 只有在定义问题模版时才会存在
export const IMAGE_ANSWER_PROMPT = `{{question}}{{templatePrompt}}{{outputFormatPrompt}}`;
export const IMAGE_ANSWER_PROMPT_EN = IMAGE_ANSWER_PROMPT;
export const IMAGE_ANSWER_PROMPT_TR = IMAGE_ANSWER_PROMPT;

/**
 * 生成图像答案提示词
 * @param {string} language - 语言，'en' 或 'zh-CN'
 * @param {Object} params - 参数对象
 * @param {number} params.number - 问题数量
 * @param {string} projectId - 项目ID（用于自定义提示词）
 * @returns {string} - 完整的提示词
 */
export async function getImageAnswerPrompt(language, { question, questionTemplate }, projectId = null) {
  const { templatePrompt, outputFormatPrompt } = getQuestionTemplate(questionTemplate, language);
  const result = await processPrompt(
    language,
    'imageAnswer',
    'IMAGE_ANSWER_PROMPT',
    { zh: IMAGE_ANSWER_PROMPT, en: IMAGE_ANSWER_PROMPT_EN, tr: IMAGE_ANSWER_PROMPT_TR },
    {
      question,
      templatePrompt,
      outputFormatPrompt
    },
    projectId
  );
  return result;
}
