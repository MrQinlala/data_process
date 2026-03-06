import { processPrompt } from '../common/prompt-loader';

// ==================== 是否题 (True/False) ====================

export const EVAL_TRUE_FALSE_PROMPT = `
# Role: 判断题生成专家
## Profile:
- Description: 你是一名专业的测评题目设计专家，擅长根据文本内容生成高质量的是否判断题，用于评估模型对知识的理解程度。
- Input Length: {{textLength}} 字
- Output Goal: 生成 {{number}} 道是否判断题，每道题需包含题目和正确答案。

## Skills:
1. 能够从文本中提取明确的事实性陈述。
2. 擅长设计具有明确对错判断的题目。
3. 善于设计干扰性题目，避免题目过于简单。
4. 严格遵守格式规范，确保输出可直接用于程序化处理。

## Workflow:
1. **文本解析**：通读全文，识别关键事实、定义、结论。
2. **题目设计**：
   - 提取明确的事实性陈述作为正确题目。
   - 设计部分错误陈述作为干扰题目。
   - 确保题目覆盖文本的不同方面。
3. **质量检查**：
   - 每道题的答案必须明确（是或否）。
   - 题目不能模棱两可。
   - 避免使用"可能"、"也许"等不确定词汇。

## Constraints:
1. 所有题目必须严格依据原文内容，不得添加外部信息。
2. 题目需覆盖文本的不同主题，避免集中于单一片段。
3. 禁止输出与材料元信息相关的题目（如作者、章节等）。
4. 题目表述需简洁明了，避免冗长复杂的句式。
5. 必须生成 {{number}} 道题目。

## Output Format:
- 使用合法的 JSON 数组，每个元素包含 question 和 correctAnswer 字段。
- correctAnswer 必须是 "❌" 或 "✅"。
- 严格遵循以下结构：
\`\`\`json
[
  {
    "question": "题目内容",
    "correctAnswer": "✅"
  }
]
\`\`\`

## Output Example:
\`\`\`json
[
  {
    "question": "人工智能是计算机科学的一个分支",
    "correctAnswer": "✅"
  },
  {
    "question": "深度学习不需要大量数据进行训练",
    "correctAnswer": "❌"
  }
]
\`\`\`

## Text to Analyze:
{{text}}
`;

export const EVAL_TRUE_FALSE_PROMPT_EN = `
# Role: True/False Question Generation Expert
## Profile:
- Description: You are an expert in designing true/false questions based on text content to assess model comprehension.
- Input Length: {{textLength}} characters
- Output Goal: Generate {{number}} true/false questions with correct answers.

## Skills:
1. Extract clear factual statements from text.
2. Design questions with definitive true/false answers.
3. Create challenging distractors to avoid overly simple questions.
4. Ensure strict formatting for programmatic processing.

## Workflow:
1. **Text Parsing**: Read the passage and identify key facts, definitions, and conclusions.
2. **Question Design**:
   - Extract clear factual statements as true questions.
   - Design false statements as distractors.
   - Ensure questions cover different aspects of the text.
3. **Quality Check**:
   - Each question must have a definitive answer (true or false).
   - Questions must be unambiguous.
   - Avoid uncertain words like "might", "perhaps".

## Constraints:
1. All questions must be strictly based on the provided text.
2. Cover diverse topics from the text; avoid clustering.
3. Do not include meta information questions (author, chapters, etc.).
4. Keep questions concise and clear.
5. Must generate exactly {{number}} questions.

## Output Format:
- Return a valid JSON array with question and correctAnswer fields.
- correctAnswer must be "✅" or "❌".
- Follow this exact structure:
\`\`\`json
[
  {
    "question": "Question content",
    "correctAnswer": "✅"
  }
]
\`\`\`

## Output Example:
\`\`\`json
[
  {
    "question": "Artificial intelligence is a branch of computer science",
    "correctAnswer": "✅"
  },
  {
    "question": "Deep learning does not require large amounts of data for training",
    "correctAnswer": "❌"
  }
]
\`\`\`

## Text to Analyze:
{{text}}
`;

// ==================== 单选题 (Single Choice) ====================

export const EVAL_SINGLE_CHOICE_PROMPT = `
# Role: 单选题生成专家
## Profile:
- Description: 你是一名专业的测评题目设计专家，擅长根据文本内容生成高质量的单选题，用于评估模型的知识掌握程度。
- Input Length: {{textLength}} 字
- Output Goal: 生成 {{number}} 道单选题，每道题需包含题目、4个选项和正确答案。

## Skills:
1. 能够从文本中提取关键信息点作为考查对象。
2. 擅长设计合理的干扰选项，增加题目难度。
3. 善于控制题目难度，确保题目具有区分度。
4. 严格遵守格式规范，确保输出可直接用于程序化处理。

## Workflow:
1. **文本解析**：通读全文，识别关键概念、定义、分类、数据等。
2. **题目设计**：
   - 选择重要知识点作为题干。
   - 设计4个选项（A、B、C、D），其中1个正确，3个干扰。
   - 干扰选项应具有一定迷惑性，但明确错误。
3. **质量检查**：
   - 确保只有一个选项完全正确。
   - 干扰选项不能模棱两可。
   - 选项长度尽量均衡。

## Constraints:
1. 所有题目必须严格依据原文内容，不得添加外部信息。
2. 题目需覆盖文本的不同主题，避免集中于单一片段。
3. 禁止输出与材料元信息相关的题目。
4. 每道题必须有且仅有4个选项。
5. 必须生成 {{number}} 道题目。

## Output Format:
- 使用合法的 JSON 数组，每个元素包含 question、options 和 correctAnswer 字段。
- options 是包含4个选项的数组。
- correctAnswer 是正确选项的索引标识（A、B、C、D），对应 options 数组中的第 0、1、2、3 个元素。
- 严格遵循以下结构：
\`\`\`json
[
  {
    "question": "题目内容",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correctAnswer": "B"
  }
]
\`\`\`

## Output Example:
\`\`\`json
[
  {
    "question": "以下哪项是深度学习的核心特征？",
    "options": ["需要人工特征工程", "自动学习特征表示", "只能处理结构化数据", "不需要大量数据"],
    "correctAnswer": "B"
  }
]
\`\`\`

## Text to Analyze:
{{text}}
`;

export const EVAL_SINGLE_CHOICE_PROMPT_EN = `
# Role: Single Choice Question Generation Expert
## Profile:
- Description: You are an expert in designing single-choice questions to assess model knowledge comprehension.
- Input Length: {{textLength}} characters
- Output Goal: Generate {{number}} single-choice questions with 4 options and correct answers.

## Skills:
1. Extract key information points from text as examination targets.
2. Design reasonable distractors to increase difficulty.
3. Control question difficulty to ensure discrimination.
4. Ensure strict formatting for programmatic processing.

## Workflow:
1. **Text Parsing**: Read the passage and identify key concepts, definitions, classifications, data, etc.
2. **Question Design**:
   - Select important knowledge points as question stems.
   - Design 4 options (A, B, C, D) with 1 correct and 3 distractors.
   - Distractors should be plausible but clearly incorrect.
3. **Quality Check**:
   - Ensure only one option is completely correct.
   - Distractors must not be ambiguous.
   - Options should be roughly equal in length.

## Constraints:
1. All questions must be strictly based on the provided text.
2. Cover diverse topics; avoid clustering.
3. Do not include meta information questions.
4. Each question must have exactly 4 options.
5. Must generate exactly {{number}} questions.

## Output Format:
- Return a valid JSON array with question, options, and correctAnswer fields.
- options is an array of 4 choices.
- correctAnswer is the option index identifier (A, B, C, D), corresponding to the 0th, 1st, 2nd, 3rd element in the options array.
- Follow this exact structure:
\`\`\`json
[
  {
    "question": "Question content",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "B"
  }
]
\`\`\`

## Output Example:
\`\`\`json
[
  {
    "question": "Which of the following is a core feature of deep learning?",
    "options": ["Requires manual feature engineering", "Automatically learns feature representations", "Can only process structured data", "Does not require large amounts of data"],
    "correctAnswer": "B"
  }
]
\`\`\`

## Text to Analyze:
{{text}}
`;

// ==================== 多选题 (Multiple Choice) ====================

export const EVAL_MULTIPLE_CHOICE_PROMPT = `
# Role: 多选题生成专家
## Profile:
- Description: 你是一名专业的测评题目设计专家，擅长根据文本内容生成高质量的多选题，用于评估模型的综合理解能力。
- Input Length: {{textLength}} 字
- Output Goal: 生成 {{number}} 道多选题，每道题需包含题目、4-6个选项和正确答案（2个或以上）。

## Skills:
1. 能够从文本中提取多个相关的知识点。
2. 擅长设计具有多个正确答案的题目。
3. 善于设计合理的干扰选项。
4. 严格遵守格式规范，确保输出可直接用于程序化处理。

## Workflow:
1. **文本解析**：通读全文，识别可以组合的多个知识点。
2. **题目设计**：
   - 选择包含多个要点的知识作为题干。
   - 设计4-6个选项，其中2-4个正确，其余为干扰项。
   - 确保正确选项之间有逻辑关联。
3. **质量检查**：
   - 确保至少有2个正确选项。
   - 干扰选项应具有迷惑性。
   - 避免"以上都对"、"以上都错"等选项。

## Constraints:
1. 所有题目必须严格依据原文内容，不得添加外部信息。
2. 题目需覆盖文本的不同主题。
3. 每道题必须有2个或以上的正确答案。
4. 必须生成 {{number}} 道题目。

## Output Format:
- 使用合法的 JSON 数组，每个元素包含 question、options 和 correctAnswer 字段。
- options 是包含4-6个选项的数组。
- correctAnswer 是包含所有正确选项索引标识的数组（如 ["A", "C"]），对应 options 数组中的元素位置。
- 严格遵循以下结构：
\`\`\`json
[
  {
    "question": "题目内容",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correctAnswer": ["A", "C"]
  }
]
\`\`\`

## Output Example:
\`\`\`json
[
  {
    "question": "以下哪些是深度学习的常用框架？",
    "options": ["TensorFlow", "PyTorch", "Excel", "Keras", "Word"],
    "correctAnswer": ["A", "B", "D"]
  }
]
\`\`\`

## Text to Analyze:
{{text}}
`;

export const EVAL_MULTIPLE_CHOICE_PROMPT_EN = `
# Role: Multiple Choice Question Generation Expert
## Profile:
- Description: You are an expert in designing multiple-choice questions to assess comprehensive understanding.
- Input Length: {{textLength}} characters
- Output Goal: Generate {{number}} multiple-choice questions with 4-6 options and 2+ correct answers.

## Skills:
1. Extract multiple related knowledge points from text.
2. Design questions with multiple correct answers.
3. Create reasonable distractors.
4. Ensure strict formatting for programmatic processing.

## Workflow:
1. **Text Parsing**: Read the passage and identify combinable knowledge points.
2. **Question Design**:
   - Select knowledge with multiple key points as question stem.
   - Design 4-6 options with 2-4 correct and others as distractors.
   - Ensure logical connection between correct options.
3. **Quality Check**:
   - Ensure at least 2 correct options.
   - Distractors should be plausible.
   - Avoid options like "all of the above" or "none of the above".

## Constraints:
1. All questions must be strictly based on the provided text.
2. Cover diverse topics.
3. Each question must have 2 or more correct answers.
4. Must generate exactly {{number}} questions.

## Output Format:
- Return a valid JSON array with question, options, and correctAnswer fields.
- options is an array of 4-6 choices.
- correctAnswer is an array containing all correct option index identifiers (e.g., ["A", "C"]), corresponding to positions in the options array.
- Follow this exact structure:
\`\`\`json
[
  {
    "question": "Question content",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": ["A", "C"]
  }
]
\`\`\`

## Output Example:
\`\`\`json
[
  {
    "question": "Which of the following are commonly used deep learning frameworks?",
    "options": ["TensorFlow", "PyTorch", "Excel", "Keras", "Word"],
    "correctAnswer": ["A", "B", "D"]
  }
]
\`\`\`

## Text to Analyze:
{{text}}
`;

// ==================== 固定短答案 (Short Answer) ====================

export const EVAL_SHORT_ANSWER_PROMPT = `
# Role: 短答案题生成专家
## Profile:
- Description: 你是一名专业的测评题目设计专家，擅长根据文本内容生成需要简短答案的题目，用于评估模型的信息提取能力。
- Input Length: {{textLength}} 字
- Output Goal: 生成 {{number}} 道短答案题，每道题需包含题目和标准答案（极短）。

## Skills:
1. 能够从文本中提取关键事实、定义、数据等。
2. 擅长设计答案明确、简短的题目。
3. 善于将答案控制到极短，便于客观评判。
4. 严格遵守格式规范，确保输出可直接用于程序化处理。

## Workflow:
1. **文本解析**：通读全文，识别关键事实、定义、数据、结论等。
2. **题目设计**：
   - 选择有明确答案的知识点作为题干。
   - 题目优先选择可用极短答案回答的事实点（实体、数值、时间、地点、名称、术语等）。
   - 题目应该是"是什么/是谁/哪里/何时/多少/哪个/哪一项"等类型，避免需要长解释的"为什么/如何"。
3. **质量检查**：
   - 答案必须明确、极短，且可从原文直接找到或直接归纳得出。
   - 答案可以在原文中直接找到或总结得出。
   - 避免需要解释、论证、比较、举例的题目。

## Constraints:
1. 所有题目必须严格依据原文内容，不得添加外部信息。
2. 题目需覆盖文本的不同主题。
3. correctAnswer 必须满足以下三选一（且只能选其一）：
   - 一个词或一个短语（不要分点、不要换行、不要解释）
   - 一个数字或一个数值（可包含小数/百分号/单位）
   - 一句简单的话（单句，不要分号/冒号/并列要点，不要解释原因）
4. 必须生成 {{number}} 道题目。

## Output Format:
- 使用合法的 JSON 数组，每个元素包含 question 和 correctAnswer 字段。
- correctAnswer 是极短答案文本（符合 Constraints 第3条）。
- 严格遵循以下结构：
\`\`\`json
[
  {
    "question": "题目内容",
    "correctAnswer": "简短答案"
  }
]
\`\`\`

## Output Example:
\`\`\`json
[
  {
    "question": "深度学习使用的典型模型结构是什么？",
    "correctAnswer": "神经网络"
  },
  {
    "question": "文中提到的最大样本量是多少？",
    "correctAnswer": "1000"
  }
]
\`\`\`

## Text to Analyze:
{{text}}
`;

export const EVAL_SHORT_ANSWER_PROMPT_EN = `
# Role: Short Answer Question Generation Expert
## Profile:
- Description: You are an expert in designing short-answer questions to assess information extraction ability.
- Input Length: {{textLength}} characters
- Output Goal: Generate {{number}} short-answer questions with ultra-short answers.

## Skills:
1. Extract key facts, definitions, data from text.
2. Design questions with clear, concise answers.
3. Control answer length for objective evaluation.
4. Ensure strict formatting for programmatic processing.

## Workflow:
1. **Text Parsing**: Read the passage and identify key facts, definitions, data, conclusions.
2. **Question Design**:
   - Select knowledge points with clear answers as question stems.
   - Prioritize facts answerable with an ultra-short response (entity, name, number, date, place, term).
   - Prefer "what/who/where/when/how many/which" types; avoid "why/how" that require explanations.
3. **Quality Check**:
   - Answers must be clear, ultra-short, and grounded in the text.
   - Answers can be found or summarized from the text.
   - Avoid questions requiring long explanations, argumentation, or comparisons.

## Constraints:
1. All questions must be strictly based on the provided text.
2. Cover diverse topics.
3. Each correctAnswer must be exactly one of the following (and only one):
   - A single word (no spaces), or a short phrase (no lists, no line breaks, no explanation)
   - A single number or numeric value (decimals/percent/units allowed)
   - One simple sentence (single sentence only; no lists; no explanation)
4. Must generate exactly {{number}} questions.

## Output Format:
- Return a valid JSON array with question and correctAnswer fields.
- correctAnswer is an ultra-short answer that follows the constraints above.
- Follow this exact structure:
\`\`\`json
[
  {
    "question": "Question content",
    "correctAnswer": "Concise answer"
  }
]
\`\`\`

## Output Example:
\`\`\`json
[
  {
    "question": "What model structure is typically used for deep learning in the text?",
    "correctAnswer": "neural network"
  },
  {
    "question": "What is the maximum sample size mentioned in the text?",
    "correctAnswer": "1000"
  }
]
\`\`\`

## Text to Analyze:
{{text}}
`;

// ==================== 开放式回答 (Open-ended) ====================

export const EVAL_OPEN_ENDED_PROMPT = `
# Role: 开放式问题生成专家
## Profile:
- Description: 你是一名专业的测评题目设计专家，擅长根据文本内容生成需要深入分析和论述的开放式问题，用于评估模型的理解和推理能力。
- Input Length: {{textLength}} 字
- Output Goal: 生成 {{number}} 道开放式问题，每道题需包含题目和参考答案（形式不限）。

## Skills:
1. 能够从文本中提取需要深入理解的主题。
2. 擅长设计需要分析、比较、评价的题目。
3. 善于提供基于原文的参考答案，能体现推理与论证过程。
4. 严格遵守格式规范，确保输出可直接用于程序化处理。

## Workflow:
1. **文本解析**：通读全文，识别核心主题、观点、论证逻辑等。
2. **题目设计**：
   - 选择需要深入理解的主题作为题干。
   - 题目应该是"如何"、"为什么"、"分析"、"比较"等类型。
   - 参考答案不要求固定要点数、句子数或固定结构；可用段落、分点、步骤、对比等任意合适形式表达。
3. **质量检查**：
   - 题目应该有一定的开放性，允许多角度回答。
   - 参考答案应基于原文信息组织论述，逻辑自洽，能够覆盖题干核心要求。
   - 避免过于简单或过于宽泛的题目。

## Constraints:
1. 所有题目必须严格依据原文内容，不得添加外部信息。
2. 题目需覆盖文本的核心主题。
4. 必须生成 {{number}} 道题目。

## Output Format:
- 使用合法的 JSON 数组，每个元素包含 question 和 correctAnswer 字段。
- correctAnswer 是参考答案（形式不限，但需基于原文、逻辑自洽，直接回应问题）。
- 严格遵循以下结构：
\`\`\`json
[
  {
    "question": "题目内容",
    "correctAnswer": "参考答案，包含多个要点"
  }
]
\`\`\`

## Output Example:
\`\`\`json
[
  {
    "question": "分析深度学习在计算机视觉领域取得成功的主要原因。",
    "correctAnswer": "深度学习在计算机视觉的成功可以从模型、数据与算力三个维度解释：一方面，卷积等结构更适合提取图像的层次化特征；另一方面，大规模标注数据让模型能够学习到更稳健的表示；同时，GPU等硬件与工程优化使得更大模型与更长训练成为可行。结合迁移学习等方法，落地成本进一步降低，从而推动了效果与应用的快速提升。"
  }
]
\`\`\`

## Text to Analyze:
{{text}}
`;

export const EVAL_OPEN_ENDED_PROMPT_EN = `
# Role: Open-ended Question Generation Expert
## Profile:
- Description: You are an expert in designing open-ended questions requiring deep analysis to assess understanding and reasoning.
- Input Length: {{textLength}} characters
- Output Goal: Generate {{number}} open-ended questions with reference answers (no fixed format).

## Skills:
1. Extract topics requiring deep understanding from text.
2. Design questions requiring analysis, comparison, evaluation.
3. Provide grounded reference answers that show reasoning and justification.
4. Ensure strict formatting for programmatic processing.

## Workflow:
1. **Text Parsing**: Read the passage and identify core themes, viewpoints, reasoning logic.
2. **Question Design**:
   - Select topics requiring deep understanding as question stems.
   - Questions should be "how", "why", "analyze", "compare" types.
   - Reference answers should NOT be forced into a fixed number of points or sentences; use whatever structure best fits the question.
3. **Quality Check**:
   - Questions should be somewhat open-ended, allowing multiple perspectives.
   - Reference answers should be grounded in the text, logical, and directly address the question.
   - Avoid overly simple or overly broad questions.

## Constraints:
1. All questions must be strictly based on the provided text.
2. Cover core themes of the text.
4. Must generate exactly {{number}} questions.

## Output Format:
- Return a valid JSON array with question and correctAnswer fields.
- correctAnswer is a reference answer (no fixed format), grounded in the text and logically coherent.
- Follow this exact structure:
\`\`\`json
[
  {
    "question": "Question content",
    "correctAnswer": "Reference answer with multiple points"
  }
]
\`\`\`

## Output Example:
\`\`\`json
[
  {
    "question": "Analyze the main reasons for deep learning's success in computer vision.",
    "correctAnswer": "Deep learning's success in computer vision can be explained by the interaction of model inductive biases, data scale, and compute. Architectures such as convolutional networks are well-suited to learning hierarchical visual features; large labeled datasets enable robust representation learning; and GPU-driven training makes large models practical. Together with engineering advances and transfer learning, these factors translate into strong performance and broad applicability across tasks."
  }
]
\`\`\`

## Text to Analyze:
{{text}}
`;

// ==================== 主函数 ====================

/**
 * 根据题型生成评估题目的提示词
 * @param {string} language - 语言，'zh-CN' 或 'en'
 * @param {string} questionType - 题型: true_false, single_choice, multiple_choice, short_answer, open_ended
 * @param {Object} params - 参数对象
 * @param {string} params.text - 待处理的文本
 * @param {number} params.number - 题目数量
 * @param {string} projectId - 项目ID（用于自定义提示词）
 * @returns {Promise<string>} - 完整的提示词
 */
export async function getEvalQuestionPrompt(language, questionType, { text, number = 5 }, projectId = null) {
  // 根据题型选择对应的提示词模板
  const promptMap = {
    true_false: {
      promptType: 'evalQuestion',
      promptKey: 'EVAL_TRUE_FALSE_PROMPT',
      templates: {
        zh: EVAL_TRUE_FALSE_PROMPT,
        en: EVAL_TRUE_FALSE_PROMPT_EN
      }
    },
    single_choice: {
      promptType: 'evalQuestion',
      promptKey: 'EVAL_SINGLE_CHOICE_PROMPT',
      templates: {
        zh: EVAL_SINGLE_CHOICE_PROMPT,
        en: EVAL_SINGLE_CHOICE_PROMPT_EN
      }
    },
    multiple_choice: {
      promptType: 'evalQuestion',
      promptKey: 'EVAL_MULTIPLE_CHOICE_PROMPT',
      templates: {
        zh: EVAL_MULTIPLE_CHOICE_PROMPT,
        en: EVAL_MULTIPLE_CHOICE_PROMPT_EN
      }
    },
    short_answer: {
      promptType: 'evalQuestion',
      promptKey: 'EVAL_SHORT_ANSWER_PROMPT',
      templates: {
        zh: EVAL_SHORT_ANSWER_PROMPT,
        en: EVAL_SHORT_ANSWER_PROMPT_EN
      }
    },
    open_ended: {
      promptType: 'evalQuestion',
      promptKey: 'EVAL_OPEN_ENDED_PROMPT',
      templates: {
        zh: EVAL_OPEN_ENDED_PROMPT,
        en: EVAL_OPEN_ENDED_PROMPT_EN
      }
    }
  };

  const config = promptMap[questionType];
  if (!config) {
    throw new Error(`不支持的题型: ${questionType}`);
  }

  const result = await processPrompt(
    language,
    config.promptType,
    config.promptKey,
    config.templates,
    {
      textLength: text.length,
      number,
      text
    },
    projectId
  );

  return result;
}
