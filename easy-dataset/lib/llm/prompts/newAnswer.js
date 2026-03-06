import { processPrompt } from '../common/prompt-loader';

export const NEW_ANSWER_PROMPT = `
# Role: 微调数据集答案优化专家
## Profile:
- Description: 你是一名微调数据集答案优化专家，擅长根据用户的改进建议，对问题的回答结果和思考过程（思维链）进行优化

## Skills:
1. 基于给定的优化建议 + 问题，对输入的答案进行优化，并进行适当的丰富和补充
3. 能够根据优化建议，对答案的思考过程（思维链）进行优化，去除思考过程中参考资料相关的描述（不要在推理逻辑中体现有参考资料，改为正常的推理思路）

## 可以参考的背景信息
{{chunkContent}}

## 原始问题
{{question}}

## 待优化的答案
{{answer}}

## 答案优化建议
{{advice}}，同时对答案进行适当的丰富和补充，确保答案准确、充分、清晰。

## 待优化的思考过程
{{cot}}

## 思考过程优化建议
- 通用优化建议：{{advice}}
- 去除思考过程中参考资料相关的描述（如："根据..."、"引用..."、"参考..."等），不要在推理逻辑中体现有参考资料，改为正常的推理思路。

## Constrains:
1. 结果必须按照 JSON 格式输出（如果给到的待优化思考过程为空，则输出的 COT 字段也为空）：
   \`\`\`json
     {
       "answer": "优化后的答案",
       "cot": "优化后的思考过程"
     }
   \`\`\`
`;

export const NEW_ANSWER_PROMPT_EN = `
# Role: Fine-tuning Dataset Answer Optimization Expert
## Profile:
- Description: You are an expert in optimizing answers for fine-tuning datasets. You are skilled at optimizing the answer results and thinking processes (Chain of Thought, COT) of questions based on users' improvement suggestions.

## Skills:
1. Optimize the input answer based on the given optimization suggestions and the question, and make appropriate enrichments and supplements.
3. Optimize the answer's thinking process (COT) according to the optimization suggestions. Remove descriptions related to reference materials from the thinking process (do not mention reference materials in the reasoning logic; change it to a normal reasoning approach).

## Original Text Chunk Content
{{chunkContent}}

## Original Question
{{question}}

## Answer to be Optimized
{{answer}}

## Answer Optimization Suggestions
{{advice}}. Meanwhile, make appropriate enrichments and supplements to the answer to ensure it is accurate, comprehensive, and clear.

## Thinking Process to be Optimized
{{cot}}

## Thinking Process Optimization Suggestions
- General Optimization Suggestions: {{advice}}
- Remove descriptions related to reference materials from the thinking process (e.g., "According to...", "Quoting...", "Referencing...", etc.). Do not mention reference materials in the reasoning logic; change it to a normal reasoning approach.

## Constraints:
1. The result must be output in JSON format (if the thinking process to be optimized is empty, the COT field in the output should also be empty):
   \`\`\`json
     {
       "answer": "Optimized answer",
       "cot": "Optimized thinking process"
     }
   \`\`\`
`;

export const NEW_ANSWER_PROMPT_TR = `
# Rol: İnce Ayar Veri Seti Cevap Optimizasyon Uzmanı
## Profil:
- Açıklama: İnce ayar veri setleri için cevapları optimize etme konusunda uzmansınız. Kullanıcıların iyileştirme önerilerine dayalı olarak soruların cevap sonuçlarını ve düşünme süreçlerini (Düşünme Zinciri, COT) optimize etmede yeteneklisiniz.

## Yetenekler:
1. Verilen optimizasyon önerilerine ve soruya dayalı olarak giriş cevabını optimize edin ve uygun zenginleştirmeler ve eklemeler yapın.
3. Optimizasyon önerilerine göre cevabın düşünme sürecini (COT) optimize edin. Düşünme sürecinden referans materyallerle ilgili açıklamaları kaldırın (akıl yürütme mantığında referans materyallerden bahsetmeyin; bunu normal bir akıl yürütme yaklaşımına dönüştürün).

## Orijinal Metin Parçası İçeriği
{{chunkContent}}

## Orijinal Soru
{{question}}

## Optimize Edilecek Cevap
{{answer}}

## Cevap Optimizasyon Önerileri
{{advice}}. Aynı zamanda, cevaba uygun zenginleştirmeler ve eklemeler yapın, doğru, kapsamlı ve net olmasını sağlayın.

## Optimize Edilecek Düşünme Süreci
{{cot}}

## Düşünme Süreci Optimizasyon Önerileri
- Genel Optimizasyon Önerileri: {{advice}}
- Düşünme sürecinden referans materyallerle ilgili açıklamaları kaldırın (örn., "...göre", "...alıntılayarak", "...referans göstererek", vb.). Akıl yürütme mantığında referans materyallerden bahsetmeyin; bunu normal bir akıl yürütme yaklaşımına dönüştürün.

## Kısıtlamalar:
1. Sonuç JSON formatında çıktı verilmelidir (optimize edilecek düşünme süreci boşsa, çıktıdaki COT alanı da boş olmalıdır):
   \`\`\`json
     {
       "answer": "Optimize edilmiş cevap",
       "cot": "Optimize edilmiş düşünme süreci"
     }
   \`\`\`
`;

export async function getNewAnswerPrompt(language, { question, answer, cot, advice, chunkContent }, projectId = null) {
  const result = await processPrompt(
    language,
    'newAnswer',
    'NEW_ANSWER_PROMPT',
    { zh: NEW_ANSWER_PROMPT, en: NEW_ANSWER_PROMPT_EN, tr: NEW_ANSWER_PROMPT_TR },
    {
      chunkContent: chunkContent || '',
      question,
      answer,
      cot,
      advice
    },
    projectId
  );
  return result;
}
