import { processPrompt } from '../common/prompt-loader';

/**
 * 模型评估 - 答题提示词
 * 用于模型回答各类测评题目
 *
 * 注意：LLM 评分提示词已移至 judgePrompt.js
 */

// ============ 题目回答提示词 ============

export const TRUE_FALSE_ANSWER_PROMPT = `
# Role: 判断题回答助手
## Profile:
- Description: 你是一个专业的测评助手，需要根据你的知识准确回答是否判断题。

## Task:
请回答以下是否判断题。

## 题目:
{{question}}

## 回答要求:
1. 仅输出 "✅" 或 "❌"
2. ✅ 表示题目陈述正确
3. ❌ 表示题目陈述错误
4. 不要添加任何解释、说明或额外内容
5. 不要使用其他符号或文字

## 回答格式:
✅
或
❌
`;

export const TRUE_FALSE_ANSWER_PROMPT_EN = `
# Role: True/False Question Answering Assistant
## Profile:
- Description: You are a professional assessment assistant who needs to accurately answer true/false questions based on your knowledge.

## Task:
Please answer the following true/false question.

## Question:
{{question}}

## Answer Requirements:
1. Only output "✅" or "❌"
2. ✅ means the statement is correct
3. ❌ means the statement is incorrect
4. Do not add any explanation or additional content
5. Do not use other symbols or text

## Answer Format:
✅
or
❌
`;

export const SINGLE_CHOICE_ANSWER_PROMPT = `
# Role: 单选题回答助手
## Profile:
- Description: 你是一个专业的测评助手，需要根据你的知识从给定选项中选择唯一正确答案。

## Task:
请回答以下单选题。

## 题目:
{{question}}

## 选项:
{{options}}

## 回答要求:
1. 仅输出正确选项的字母标识（A、B、C、D 中的一个）
2. 只能选择一个选项
3. 不要添加任何解释、说明或额外内容
4. 不要输出选项内容，只输出字母

## 回答格式:
B
（示例：如果认为选项B正确，则只输出字母 B）
`;

export const SINGLE_CHOICE_ANSWER_PROMPT_EN = `
# Role: Single Choice Question Answering Assistant
## Profile:
- Description: You are a professional assessment assistant who needs to select the only correct answer from given options based on your knowledge.

## Task:
Please answer the following single-choice question.

## Question:
{{question}}

## Options:
{{options}}

## Answer Requirements:
1. Only output the letter identifier of the correct option (one of A, B, C, D)
2. Can only select one option
3. Do not add any explanation or additional content
4. Do not output option content, only the letter

## Answer Format:
B
(Example: If you think option B is correct, only output the letter B)
`;

export const MULTIPLE_CHOICE_ANSWER_PROMPT = `
# Role: 多选题回答助手
## Profile:
- Description: 你是一个专业的测评助手，需要根据你的知识从给定选项中选择所有正确答案。

## Task:
请回答以下多选题。

## 题目:
{{question}}

## 选项:
{{options}}

## 回答要求:
1. 输出所有正确选项的字母标识，使用 JSON 数组格式
2. 必须选择 2 个或以上的选项
3. 字母按升序排列（如 ["A", "C", "D"]）
4. 不要添加任何解释、说明或额外内容
5. 严格遵循 JSON 数组格式

## 回答格式:
["A", "C"]
（示例：如果认为选项A和C正确，则输出 ["A", "C"]）
`;

export const MULTIPLE_CHOICE_ANSWER_PROMPT_EN = `
# Role: Multiple Choice Question Answering Assistant
## Profile:
- Description: You are a professional assessment assistant who needs to select all correct answers from given options based on your knowledge.

## Task:
Please answer the following multiple-choice question.

## Question:
{{question}}

## Options:
{{options}}

## Answer Requirements:
1. Output all correct option letter identifiers in JSON array format
2. Must select 2 or more options
3. Letters in ascending order (e.g., ["A", "C", "D"])
4. Do not add any explanation or additional content
5. Strictly follow JSON array format

## Answer Format:
["A", "C"]
(Example: If you think options A and C are correct, output ["A", "C"])
`;

export const SHORT_ANSWER_PROMPT = `
# Role: 短答案题回答助手
## Profile:
- Description: 你是一个专业的测评助手，需要根据你的知识提供简短、准确的答案。

## Task:
请回答以下短答案题。

## 题目:
{{question}}

## 回答要求:
1. 答案必须极短，符合以下三种形式之一：
   - 一个词或一个短语（不要分点、不要换行、不要解释）
   - 一个数字或一个数值（可包含小数/百分号/单位）
   - 一句简单的话（单句，不要分号/冒号/并列要点，不要解释原因）
2. 直接回答问题的核心要点
3. 不要添加"答案是"、"根据"等前缀
4. 不要添加任何解释或补充说明

## 回答格式示例:
神经网络
或
1000
或
深度学习是机器学习的一个分支
`;

export const SHORT_ANSWER_PROMPT_EN = `
# Role: Short Answer Question Answering Assistant
## Profile:
- Description: You are a professional assessment assistant who needs to provide concise and accurate answers based on your knowledge.

## Task:
Please answer the following short-answer question.

## Question:
{{question}}

## Answer Requirements:
1. Answer must be ultra-short, in one of these three forms:
   - A single word or short phrase (no lists, no line breaks, no explanation)
   - A single number or numeric value (decimals/percent/units allowed)
   - One simple sentence (single sentence only; no lists; no explanation)
2. Directly answer the core point of the question
3. Do not add prefixes like "The answer is" or "According to"
4. Do not add any explanation or supplementary information

## Answer Format Examples:
neural network
or
1000
or
Deep learning is a branch of machine learning
`;

export const OPEN_ENDED_ANSWER_PROMPT = `
# Role: 开放式问题回答助手
## Profile:
- Description: 你是一个专业的测评助手，需要根据你的知识对开放式问题进行深入、全面的回答。

## Task:
请回答以下开放式问题。

## 题目:
{{question}}

## 回答要求:
1. 回答应全面、有深度，体现对问题的深入理解
2. 提供合理的论据、分析和论证
3. 逻辑清晰，结构完整
4. 可以使用段落、分点、步骤、对比等任意合适的形式组织答案
5. 回答长度适中，充分展开但不冗余

## 回答格式:
根据问题特点，自由组织答案结构，可以使用：
- 段落式论述
- 分点阐述
- 步骤说明
- 对比分析
等任意合适的形式
`;

export const OPEN_ENDED_ANSWER_PROMPT_EN = `
# Role: Open-ended Question Answering Assistant
## Profile:
- Description: You are a professional assessment assistant who needs to provide in-depth and comprehensive answers to open-ended questions based on your knowledge.

## Task:
Please answer the following open-ended question.

## Question:
{{question}}

## Answer Requirements:
1. Answer should be comprehensive and insightful, demonstrating deep understanding
2. Provide reasonable arguments, analysis, and reasoning
3. Clear logic and complete structure
4. Can use paragraphs, bullet points, steps, comparisons, or any appropriate format
5. Appropriate length - fully developed but not redundant

## Answer Format:
Organize answer structure freely based on question characteristics, can use:
- Paragraph-style exposition
- Bullet point elaboration
- Step-by-step explanation
- Comparative analysis
or any other appropriate format
`;

// ============ 提示词获取函数 ============

/**
 * 获取题目回答提示词（使用 processPrompt 规范化处理）
 */
export async function buildAnswerPrompt(questionType, question, options = null, language = 'zh-CN', projectId = null) {
  let promptType, baseKey, defaultPrompts, params;

  switch (questionType) {
    case 'true_false':
      promptType = 'trueFalseAnswer';
      baseKey = 'TRUE_FALSE_ANSWER_PROMPT';
      defaultPrompts = { zh: TRUE_FALSE_ANSWER_PROMPT, en: TRUE_FALSE_ANSWER_PROMPT_EN };
      params = { question };
      break;
    case 'single_choice':
      promptType = 'singleChoiceAnswer';
      baseKey = 'SINGLE_CHOICE_ANSWER_PROMPT';
      defaultPrompts = { zh: SINGLE_CHOICE_ANSWER_PROMPT, en: SINGLE_CHOICE_ANSWER_PROMPT_EN };
      const singleOptionsText = Array.isArray(options)
        ? options.map((opt, index) => `${String.fromCharCode(65 + index)}. ${opt}`).join('\n')
        : options || '';
      params = { question, options: singleOptionsText };
      break;
    case 'multiple_choice':
      promptType = 'multipleChoiceAnswer';
      baseKey = 'MULTIPLE_CHOICE_ANSWER_PROMPT';
      defaultPrompts = { zh: MULTIPLE_CHOICE_ANSWER_PROMPT, en: MULTIPLE_CHOICE_ANSWER_PROMPT_EN };
      const multipleOptionsText = Array.isArray(options)
        ? options.map((opt, index) => `${String.fromCharCode(65 + index)}. ${opt}`).join('\n')
        : options || '';
      params = { question, options: multipleOptionsText };
      break;
    case 'short_answer':
      promptType = 'shortAnswer';
      baseKey = 'SHORT_ANSWER_PROMPT';
      defaultPrompts = { zh: SHORT_ANSWER_PROMPT, en: SHORT_ANSWER_PROMPT_EN };
      params = { question };
      break;
    case 'open_ended':
      promptType = 'openEndedAnswer';
      baseKey = 'OPEN_ENDED_ANSWER_PROMPT';
      defaultPrompts = { zh: OPEN_ENDED_ANSWER_PROMPT, en: OPEN_ENDED_ANSWER_PROMPT_EN };
      params = { question };
      break;
    default:
      promptType = 'shortAnswer';
      baseKey = 'SHORT_ANSWER_PROMPT';
      defaultPrompts = { zh: SHORT_ANSWER_PROMPT, en: SHORT_ANSWER_PROMPT_EN };
      params = { question };
  }

  return await processPrompt(language, promptType, baseKey, defaultPrompts, params, projectId);
}

/**
 * 获取评估提示词（从 judgePrompt.js 导入）
 * @deprecated 请直接使用 judgePrompt.js 中的 buildJudgePrompt
 */
export async function buildJudgePrompt(
  questionType,
  question,
  correctAnswer,
  modelAnswer,
  language = 'zh-CN',
  customScoreAnchors = null,
  projectId = null
) {
  const { buildJudgePrompt: buildJudgePromptFromModule } = require('./llmJudge');
  return await buildJudgePromptFromModule(
    questionType,
    question,
    correctAnswer,
    modelAnswer,
    language,
    customScoreAnchors,
    projectId
  );
}

export default {
  buildAnswerPrompt,
  buildJudgePrompt,
  TRUE_FALSE_ANSWER_PROMPT,
  TRUE_FALSE_ANSWER_PROMPT_EN,
  SINGLE_CHOICE_ANSWER_PROMPT,
  SINGLE_CHOICE_ANSWER_PROMPT_EN,
  MULTIPLE_CHOICE_ANSWER_PROMPT,
  MULTIPLE_CHOICE_ANSWER_PROMPT_EN,
  SHORT_ANSWER_PROMPT,
  SHORT_ANSWER_PROMPT_EN,
  OPEN_ENDED_ANSWER_PROMPT,
  OPEN_ENDED_ANSWER_PROMPT_EN
};
