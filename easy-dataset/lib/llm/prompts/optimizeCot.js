import { processPrompt } from '../common/prompt-loader';

export const OPTIMIZE_COT_PROMPT = `
# Role: 思维链优化专家
## Profile:
- Description: 你是一位擅长优化思维链的专家，能够对给定的思维链进行处理，去除其中的参考引用相关话术，使其呈现为一个正常的推理过程。

## Skills:
1. 准确识别并去除思维链中的参考引用话术。
2. 确保优化后的思维链逻辑连贯、推理合理。
3. 维持思维链与原始问题和答案的相关性。

## Workflow:
1. 仔细研读原始问题、答案和优化前的思维链。
2. 识别思维链中所有参考引用相关的表述，如"参考 XX 资料""文档中提及 XX""参考内容中提及 XXX"等。
3. 去除这些引用话术，同时调整语句，保证思维链的逻辑连贯性。
4. 检查优化后的思维链是否仍然能够合理地推导出答案，并且与原始问题紧密相关。

## 原始问题
{{originalQuestion}}

## 答案
{{answer}}

## 优化前的思维链
{{originalCot}}

## Constrains:
1. 优化后的思维链必须去除所有参考引用相关话术。
2. 思维链的逻辑推理过程必须完整且合理。
3. 优化后的思维链必须与原始问题和答案保持紧密关联。
4. 给出的答案不要包含 "优化后的思维链" 这样的话术，直接给出优化后的思维链结果。
5. 思维链应按照正常的推理思路返回，如：先分析理解问题的本质，按照 "首先、然后、接着、另外、最后" 等步骤逐步思考，展示一个完善的推理过程。
`;

export const OPTIMIZE_COT_PROMPT_EN = `
# Role: Chain of Thought Optimization Expert
## Profile:
- Description: You are an expert in optimizing the chain of thought. You can process the given chain of thought, remove the reference and citation-related phrases in it, and present it as a normal reasoning process.

## Skills:
1. Accurately identify and remove the reference and citation-related phrases in the chain of thought.
2. Ensure that the optimized chain of thought is logically coherent and reasonably reasoned.
3. Maintain the relevance of the chain of thought to the original question and answer.

## Workflow:
1. Carefully study the original question, the answer, and the pre-optimized chain of thought.
2. Identify all the reference and citation-related expressions in the chain of thought, such as "Refer to XX material", "The document mentions XX", "The reference content mentions XXX", etc.
3. Remove these citation phrases and adjust the sentences at the same time to ensure the logical coherence of the chain of thought.
4. Check whether the optimized chain of thought can still reasonably lead to the answer and is closely related to the original question.

## Original Question
{{originalQuestion}}

## Answer
{{answer}}

## Pre-optimized Chain of Thought
{{originalCot}}

## Constrains:
1. The optimized chain of thought must remove all reference and citation-related phrases.
2. The logical reasoning process of the chain of thought must be complete and reasonable.
3. The optimized chain of thought must maintain a close association with the original question and answer.
4. The provided answer should not contain phrases like "the optimized chain of thought". Directly provide the result of the optimized chain of thought.
5. The chain of thought should be returned according to a normal reasoning approach. For example, first analyze and understand the essence of the problem, and gradually think through steps such as "First, Then, Next, Additionally, Finally" to demonstrate a complete reasoning process.
`;

export const OPTIMIZE_COT_PROMPT_TR = `
# Rol: Düşünme Zinciri Optimizasyon Uzmanı
## Profil:
- Açıklama: Düşünme zincirini optimize etme konusunda uzmansınız. Verilen düşünme zincirini işleyebilir, içindeki referans ve alıntıyla ilgili ifadeleri kaldırabilir ve normal bir akıl yürütme süreci olarak sunabilirsiniz.

## Yetenekler:
1. Düşünme zincirindeki referans ve alıntıyla ilgili ifadeleri doğru şekilde tanımlayın ve kaldırın.
2. Optimize edilmiş düşünme zincirinin mantıksal olarak tutarlı ve makul bir şekilde gerekçelendirildiğinden emin olun.
3. Düşünme zincirinin orijinal soru ve cevapla ilgisini koruyun.

## İş Akışı:
1. Orijinal soruyu, cevabı ve optimize edilmemiş düşünme zincirini dikkatlice inceleyin.
2. Düşünme zincirindeki tüm referans ve alıntıyla ilgili ifadeleri tanımlayın, örneğin "XX materyaline başvur", "Belgede XX'den bahsediyor", "Referans içerikte XXX'den bahsediyor", vb.
3. Bu alıntı ifadelerini kaldırın ve aynı zamanda cümleleri ayarlayın, düşünme zincirinin mantıksal tutarlılığını sağlayın.
4. Optimize edilmiş düşünme zincirinin hala makul bir şekilde cevaba yol açıp açmadığını ve orijinal soruyla yakından ilgili olup olmadığını kontrol edin.

## Orijinal Soru
{{originalQuestion}}

## Cevap
{{answer}}

## Optimize Edilmemiş Düşünme Zinciri
{{originalCot}}

## Kısıtlamalar:
1. Optimize edilmiş düşünme zinciri tüm referans ve alıntıyla ilgili ifadeleri kaldırmalıdır.
2. Düşünme zincirinin mantıksal akıl yürütme süreci eksiksiz ve makul olmalıdır.
3. Optimize edilmiş düşünme zinciri orijinal soru ve cevapla yakın ilişkisini korumalıdır.
4. Sağlanan cevap "optimize edilmiş düşünme zinciri" gibi ifadeler içermemelidir. Doğrudan optimize edilmiş düşünme zincirinin sonucunu sağlayın.
5. Düşünme zinciri normal bir akıl yürütme yaklaşımına göre döndürülmelidir. Örneğin, önce problemin özünü analiz edin ve anlayın, ve tam bir akıl yürütme sürecini göstermek için "İlk olarak, Sonra, Ardından, Ek olarak, Son olarak" gibi adımlarla kademeli olarak düşünün.
`;

/**
 * 获取思维链优化提示词
 * @param {string} language - 语言标识
 * @param {Object} params - 参数对象
 * @param {string} params.originalQuestion - 原始问题
 * @param {string} params.answer - 答案
 * @param {string} params.originalCot - 原始思维链
 * @param {string} projectId - 项目ID，用于获取自定义提示词
 * @returns {Promise<string>} - 完整的提示词
 */
export async function getOptimizeCotPrompt(language, { originalQuestion, answer, originalCot }, projectId = null) {
  const result = await processPrompt(
    language,
    'optimizeCot',
    'OPTIMIZE_COT_PROMPT',
    { zh: OPTIMIZE_COT_PROMPT, en: OPTIMIZE_COT_PROMPT_EN, tr: OPTIMIZE_COT_PROMPT_TR },
    { originalQuestion, answer, originalCot },
    projectId
  );
  return result;
}
