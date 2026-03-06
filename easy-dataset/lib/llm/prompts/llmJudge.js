import { processPrompt } from '../common/prompt-loader';

/**
 * LLM 评估提示词
 * 用于评估模型在主观题目上的回答质量
 */

// ============ 默认评分规则常量 ============

// 简答题默认评分规则（中文）
export const DEFAULT_SHORT_ANSWER_SCORE_ANCHORS_ZH = [
  { range: '1.0', description: '完全等价正确（数值/范围/实体/要点都对）；无冲突或编造。' },
  { range: '0.8-0.9', description: '基本正确；仅有轻微不严谨或漏次要点；无关键错误。' },
  { range: '0.6-0.7', description: '部分正确但存在明显遗漏；核心方向仍对；无重大错误。' },
  { range: '0.3-0.5', description: '仅命中少量信息；或存在多处不准确；难以认为回答到位。' },
  { range: '0.0-0.2', description: '答非所问/关键事实错误/大量编造/空答。' }
];

// 简答题默认评分规则（英文）
export const DEFAULT_SHORT_ANSWER_SCORE_ANCHORS_EN = [
  { range: '1.0', description: 'Fully equivalent correct; no contradictions or fabrication.' },
  { range: '0.8-0.9', description: 'Mostly correct; only minor omissions/imprecision; no key errors.' },
  { range: '0.6-0.7', description: 'Partly correct with clear omissions; core direction correct; no major errors.' },
  { range: '0.3-0.5', description: 'Only small parts correct and/or multiple inaccuracies; inadequate.' },
  { range: '0.0-0.2', description: 'Off-topic / key factual wrong / heavy fabrication / empty.' }
];

// 开放题默认评分规则（中文）
export const DEFAULT_OPEN_ENDED_SCORE_ANCHORS_ZH = [
  { range: '1.0', description: '关键点充分且正确；论证扎实；无明显错误；细节具体。' },
  { range: '0.8-0.9', description: '整体很强；仅有轻微遗漏/措辞不严谨；无关键错误。' },
  { range: '0.6-0.7', description: '能回答问题但不够完整或偏泛；论证一般；可能有小错误。' },
  { range: '0.3-0.5', description: '明显不完整、偏题或泛泛而谈；或包含多处不准确。' },
  { range: '0.0-0.2', description: '答非所问/大量编造/严重错误/空答。' }
];

// 开放题默认评分规则（英文）
export const DEFAULT_OPEN_ENDED_SCORE_ANCHORS_EN = [
  { range: '1.0', description: 'Correct, thorough, well-justified, concrete; no notable errors.' },
  { range: '0.8-0.9', description: 'Strong overall; only minor omissions/wording; no key errors.' },
  { range: '0.6-0.7', description: 'Adequate but incomplete or generic; average reasoning; maybe minor errors.' },
  { range: '0.3-0.5', description: 'Incomplete, off-topic, or overly generic; and/or multiple inaccuracies.' },
  { range: '0.0-0.2', description: 'Irrelevant, largely fabricated, severely wrong, or empty.' }
];

/**
 * 获取默认评分规则
 * @param {string} questionType - 题目类型：'short_answer' 或 'open_ended'
 * @param {string} language - 语言：'zh-CN' 或 'en'
 * @returns {Array} 评分规则数组
 */
export function getDefaultScoreAnchors(questionType, language = 'zh-CN') {
  const isEn = language === 'en';

  if (questionType === 'open_ended') {
    return isEn ? DEFAULT_OPEN_ENDED_SCORE_ANCHORS_EN : DEFAULT_OPEN_ENDED_SCORE_ANCHORS_ZH;
  }
  return isEn ? DEFAULT_SHORT_ANSWER_SCORE_ANCHORS_EN : DEFAULT_SHORT_ANSWER_SCORE_ANCHORS_ZH;
}

/**
 * 将评分规则数组格式化为提示词文本
 * @param {Array} scoreAnchors - 评分规则数组
 * @returns {string} 格式化后的文本
 */
export function formatScoreAnchors(scoreAnchors) {
  if (!scoreAnchors || scoreAnchors.length === 0) {
    return '';
  }
  return scoreAnchors.map(anchor => `- ${anchor.range}：${anchor.description}`).join('\n');
}

// ============ LLM 评分提示词 ============

export const SHORT_ANSWER_JUDGE_PROMPT = `
# Role: 严谨的阅卷教师（短答案）

## Task
对短答案进行严格评分：答案通常是数值/百分比/范围/实体名/短语/要点列表。只要有关键缺失或事实错误就要明显扣分，不要默认给高分。

## Grading Rules
- 先从参考答案中提炼关键点（短答案通常 1-5 个即可）：事实/数值/单位/范围/对象/限定条件/结论。
- 对照学生答案逐条判断：命中/部分命中/未命中，并检查是否出现“冲突点”。
- 允许同义改写与等价表达，但不允许改变事实（例如把 84% 写成 84 台、把“近 3 倍”写成“3%”）。
- 发现编造、与参考答案冲突、概念性错误：必须显著扣分。
- 句子更长≠更好；短答案看信息是否对、是否全、是否精确。

## Normalization (评分前先做一致化理解)
- 忽略空格、全半角、大小写差异；百分号“%”与“百分之”视为等价。
- 数值允许轻微四舍五入（例如 83.9%≈84%），但单位必须一致或可等价换算。
- 范围/区间必须落在参考范围内（如 “30%~50%”），越界视为错误。
- 列表/多要点答案：必须覆盖所有关键项；漏 1 项是“缺失”，写错 1 项是“错误”。

## Score Anchors (0.0-1.0, step 0.1)
{{scoreAnchors}}

## Caps (用于防止高分泛滥)
- 缺失任何“核心关键点”（问题必须回答的点）：score ≤ 0.7
- 出现 1 个“重大事实错误/与参考冲突”：score ≤ 0.4
- 出现 2 个及以上重大错误或大量编造：score ≤ 0.2

## Question
{{question}}

## Reference Answer
{{correctAnswer}}

## Student Answer
{{modelAnswer}}

## Output
请严格按照以下 JSON 格式输出评分结果，不要添加任何其他内容：

\`\`\`json
{
  "score": <根据 Score Anchors 评定的分数>,
  "reason": "<评分理由>"
}
\`\`\`

要求：
- score 为 0.0-1.0，精确到 0.1，严格依据上述 Score Anchors 标准评定
- reason ≤ 100 字，必须点出：命中情况 + 主要缺失/错误 + 总评
- 只输出可解析 JSON
`;

export const SHORT_ANSWER_JUDGE_PROMPT_EN = `
# Role: Strict Grader (Short Answer)

## Task
Grade strictly. Short answers are usually numbers/percentages/ranges/entities/phrases/bullets. Do not default to high scores.

## Grading Rules
- Extract key points from the reference answer (usually 1-5 for short answers): value/unit/range/entity/constraints/conclusion.
- Check each point as hit / partial / miss, and also look for contradictions.
- Accept equivalent paraphrases, but not changed facts (e.g., 84% ≠ 84 units).
- Heavily penalize hallucinations, contradictions, and concept errors.
- Longer wording is not better; short answers are judged by correctness and completeness.

## Normalization
- Ignore whitespace/case/locale punctuation differences; treat “%” and “percent” equivalently.
- Allow minor rounding (e.g., 83.9% ≈ 84%), but units must match or be equivalent.
- Ranges must fall within the reference range; out-of-range is wrong.
- Lists must cover all required items; missing = incomplete, wrong item = error.

## Score Anchors (0.0-1.0, step 0.1)
{{scoreAnchors}}

## Caps
- Missing any essential key point: score ≤ 0.7
- One major factual contradiction/hallucination: score ≤ 0.4
- Two+ major errors or lots of fabrication: score ≤ 0.2

## Question
{{question}}

## Reference Answer
{{correctAnswer}}

## Student Answer
{{modelAnswer}}

## Output
Strictly output the result in the following JSON format, with no extra text:

\`\`\`json
{
  "score": <score based on Score Anchors>,
  "reason": "<evaluation reason>"
}
\`\`\`

Requirements:
- score in [0.0, 1.0], step 0.1, strictly follow the Score Anchors above
- reason ≤ 100 words: hits + main misses/errors + overall
- JSON only
`;

export const OPEN_ENDED_JUDGE_PROMPT = `
# Role: 严谨的评估专家（开放题/长答案）

## Task
评估长答案的质量与可靠性，避免“看起来不错就给 0.8”。参考答案用于核对关键事实与覆盖面，但允许合理的等价表达与不同论证路径。

## What to Judge
1) 关键正确性：核心事实/概念是否正确，是否自相矛盾或编造。
2) 覆盖与针对性：是否回答了题目要求，是否遗漏关键部分或跑题。
3) 论证与结构：是否有清晰结构、因果链/依据，是否只给空泛结论。
4) 可用性：是否给出具体、可执行/可验证的说明（视题目而定）。

## Score Anchors (0.0-1.0, step 0.1)
{{scoreAnchors}}

## Caps
- 出现 1 个“重大事实错误/与参考关键事实冲突/关键推理错误”：score ≤ 0.4
- 出现 2 个及以上重大错误或大量编造：score ≤ 0.2
- 明显跑题或只给泛泛总结：score ≤ 0.5

## Question
{{question}}

## Reference Answer (for checking)
{{correctAnswer}}

## Student Answer
{{modelAnswer}}

## Output
请严格按照以下 JSON 格式输出评分结果，不要添加任何其他内容：

\`\`\`json
{
  "score": <根据 Score Anchors 评定的分数>,
  "reason": "<评分理由>"
}
\`\`\`

要求：
- score 为 0.0-1.0，精确到 0.1，严格依据上述 Score Anchors 标准评定
- reason ≤ 150 字，必须包含：优点 + 主要问题（遗漏/错误/空泛/跑题）+ 总评
- 只输出可解析 JSON
`;

export const OPEN_ENDED_JUDGE_PROMPT_EN = `
# Role: Strict Evaluator (Open-ended / Long Answer)

## Task
Judge quality and reliability. The reference answer helps validate key facts/coverage, but allow equivalent correct approaches. Do not default to 0.8.

## What to Judge
1) Key correctness: core facts/concepts are correct; no contradictions or fabricated claims.
2) Coverage & focus: answers what the question asks; avoids drifting; covers essential parts.
3) Reasoning & structure: clear structure and justification; not just vague conclusions.
4) Usefulness: concrete, actionable/verifiable details when applicable.

## Score Anchors (0.0-1.0, step 0.1)
{{scoreAnchors}}

## Caps
- One major factual contradiction/hallucination or critical reasoning error: score ≤ 0.4
- Two+ major errors or heavy fabrication: score ≤ 0.2
- Clearly off-topic or purely generic summary: score ≤ 0.5

## Question
{{question}}

## Reference Answer (for checking)
{{correctAnswer}}

## Student Answer
{{modelAnswer}}

## Output
Strictly output the result in the following JSON format, with no extra text:

\`\`\`json
{
  "score": <score based on Score Anchors>,
  "reason": "<evaluation reason>"
}
\`\`\`

Requirements:
- score in [0.0, 1.0], step 0.1, strictly follow the Score Anchors above
- reason ≤ 150 words: strengths + main issues (missing/error/generic/off-topic) + overall
- JSON only
`;

// ============ 提示词获取函数 ============

/**
 * 构建评分提示词（使用 processPrompt 规范化处理）
 * @param {string} questionType - 题型
 * @param {string} question - 题目
 * @param {string} correctAnswer - 正确答案
 * @param {string} modelAnswer - 模型答案
 * @param {string} language - 语言
 * @param {Array} customScoreAnchors - 自定义评分规则（可选）
 * @param {string} projectId - 项目ID（可选）
 * @returns {Promise<string>} - 完整的评分提示词
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
  let promptType, baseKey, defaultPrompts;

  switch (questionType) {
    case 'short_answer':
      promptType = 'shortAnswerJudge';
      baseKey = 'SHORT_ANSWER_JUDGE_PROMPT';
      defaultPrompts = { zh: SHORT_ANSWER_JUDGE_PROMPT, en: SHORT_ANSWER_JUDGE_PROMPT_EN };
      break;
    case 'open_ended':
      promptType = 'openEndedJudge';
      baseKey = 'OPEN_ENDED_JUDGE_PROMPT';
      defaultPrompts = { zh: OPEN_ENDED_JUDGE_PROMPT, en: OPEN_ENDED_JUDGE_PROMPT_EN };
      break;
    default:
      promptType = 'shortAnswerJudge';
      baseKey = 'SHORT_ANSWER_JUDGE_PROMPT';
      defaultPrompts = { zh: SHORT_ANSWER_JUDGE_PROMPT, en: SHORT_ANSWER_JUDGE_PROMPT_EN };
  }

  // 获取评分规则文本（自定义或默认）
  let scoreAnchorsText;
  if (customScoreAnchors && Array.isArray(customScoreAnchors) && customScoreAnchors.length === 5) {
    scoreAnchorsText = formatScoreAnchors(customScoreAnchors);
  } else {
    const defaultScoreAnchors = getDefaultScoreAnchors(questionType, language);
    scoreAnchorsText = formatScoreAnchors(defaultScoreAnchors);
  }

  const params = {
    question,
    correctAnswer,
    modelAnswer,
    scoreAnchors: scoreAnchorsText
  };

  return await processPrompt(language, promptType, baseKey, defaultPrompts, params, projectId);
}

export default {
  buildJudgePrompt,
  getDefaultScoreAnchors,
  formatScoreAnchors,
  SHORT_ANSWER_JUDGE_PROMPT,
  SHORT_ANSWER_JUDGE_PROMPT_EN,
  OPEN_ENDED_JUDGE_PROMPT,
  OPEN_ENDED_JUDGE_PROMPT_EN
};
