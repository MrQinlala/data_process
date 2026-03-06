export function getQuestionTemplate(questionTemplate, language) {
  let templatePrompt = '';
  let outputFormatPrompt = '';
  if (questionTemplate) {
    const { customFormat, description, labels, answerType } = questionTemplate;
    if (description) {
      templatePrompt = `\n\n${description}`;
    }
    if (answerType === 'label') {
      outputFormatPrompt =
        language === 'en'
          ? ` \n\n ## Output Format \n\n Final output must be a string array, and must be selected from the following array, if the answer is not in the target array, return: ["other"] No additional information can be added: \n\n${labels}`
          : `\n\n ## 输出格式 \n\n 最终输出必须是一个字符串数组，而且必须在以下数组中选择，如果答案不在目标数组中，返回：["其他"] 不得额外添加任何其他信息：\n\n${labels}`;
    } else if (answerType === 'custom_format') {
      outputFormatPrompt =
        language === 'en'
          ? ` \n\n ## Output Format \n\n Final output must strictly follow the following structure, no additional information can be added: \n\n${customFormat}`
          : `\n\n ## 输出格式 \n\n 最终输出必须严格遵循以下结构，不得额外添加任何其他信息：\n\n${customFormat}`;
    }
  }
  return {
    templatePrompt,
    outputFormatPrompt
  };
}
