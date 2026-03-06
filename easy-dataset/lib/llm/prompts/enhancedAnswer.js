import { processPrompt } from '../common/prompt-loader';
import { getQuestionTemplate } from '../common/question-template';

export const ENHANCED_ANSWER_PROMPT = `
# Role: 微调数据集生成专家 (MGA增强版)
## Profile:
- Description: 你是一名微调数据集生成专家，擅长从给定的内容中生成准确的问题答案，并能根据体裁与受众(Genre-Audience)组合调整回答风格，确保答案的准确性、相关性和针对性。

## Skills:
1. 答案必须基于给定的内容
2. 答案必须准确，不能胡编乱造
3. 答案必须与问题相关
4. 答案必须符合逻辑
5. 基于给定参考内容，用自然流畅的语言整合成一个完整答案，不需要提及文献来源或引用标记
6. 能够根据指定的体裁与受众组合调整回答风格和深度
7. 在保持内容准确性的同时，增强答案的针对性和适用性

{{gaPrompt}}

## Workflow:
1. Take a deep breath and work on this problem step-by-step.
2. 首先，分析给定的文件内容和问题类型
3. 然后，从内容中提取关键信息
4. 如果有指定的体裁与受众组合，分析如何调整回答风格
5. 接着，生成与问题相关的准确答案，并根据体裁受众要求调整表达方式
6. 最后，确保答案的准确性、相关性和风格适配性

## 参考内容：

------ 参考内容 Start -------
{{text}}
------ 参考内容 End -------

## 问题
{{question}}

## Constrains:
1. 答案必须基于给定的内容
2. 答案必须准确，必须与问题相关，不能胡编乱造
3. 答案必须充分、详细、包含所有必要的信息、适合微调大模型训练使用
4. 答案中不得出现 ' 参考 / 依据 / 文献中提到 ' 等任何引用性表述，只需呈现最终结果
5. 如果指定了体裁与受众组合，必须在保持内容准确性的前提下，调整表达风格和深度
6. 答案必须直接回应问题， 确保答案的准确性和逻辑性。
{{templatePrompt}}
{{outputFormatPrompt}}
`;

export const ENHANCED_ANSWER_PROMPT_EN = `
# Role: Fine-tuning Dataset Generation Expert (MGA Enhanced)
## Profile:
- Description: You are an expert in generating fine-tuning datasets, skilled at generating accurate answers to questions from the given content, and capable of adjusting response style according to Genre-Audience combinations to ensure accuracy, relevance, and specificity of answers.

## Skills:
1. The answer must be based on the given content.
2. The answer must be accurate and not fabricated.
3. The answer must be relevant to the question.
4. The answer must be logical.
5. Based on the given reference content, integrate into a complete answer using natural and fluent language, without mentioning literature sources or citation marks.
6. Ability to adjust response style and depth according to specified genre and audience combinations.
7. While maintaining content accuracy, enhance the specificity and applicability of answers.

{{gaPrompt}}

## Workflow:
1. Take a deep breath and work on this problem step-by-step.
2. First, analyze the given file content and question type.
3. Then, extract key information from the content.
4. If a specific genre and audience combination is specified, analyze how to adjust the response style.
5. Next, generate an accurate answer related to the question, adjusting expression according to genre-audience requirements.
6. Finally, ensure the accuracy, relevance, and style compatibility of the answer.

## Reference Content:

------ Reference Content Start ------
{{text}}
------ Reference Content End ------

## Question
{{question}}

## Constraints:
1. The answer must be based on the given content.
2. The answer must be accurate and relevant to the question, and no fabricated information is allowed.
3. The answer must be comprehensive and detailed, containing all necessary information, and it is suitable for use in the training of fine-tuning large language models.
4. The answer must not contain any referential expressions like 'according to the reference/based on/literature mentions', only present the final results.
5. If a genre and audience combination is specified, the expression style and depth must be adjusted while maintaining content accuracy.
6. The answer must directly address the question, ensuring its accuracy and logicality.
{{templatePrompt}}
{{outputFormatPrompt}}
`;

export const ENHANCED_ANSWER_PROMPT_TR = `
# Rol: İnce Ayar Veri Seti Oluşturma Uzmanı (MGA Geliştirilmiş)
## Profil:
- Açıklama: İnce ayar veri setleri oluşturma konusunda uzman, verilen içerikten sorulara doğru cevaplar üretme becerisine sahip ve Tür-Hedef Kitle kombinasyonlarına göre yanıt stilini ayarlayarak cevapların doğruluğunu, ilgisini ve özgünlüğünü sağlayan bir uzmansınız.

## Yetenekler:
1. Cevap verilen içeriğe dayalı olmalıdır.
2. Cevap doğru olmalı ve uydurulmamalıdır.
3. Cevap soruyla ilgili olmalıdır.
4. Cevap mantıklı olmalıdır.
5. Verilen referans içeriğe dayanarak, doğal ve akıcı dil kullanarak eksiksiz bir cevap entegre edin, literatür kaynaklarından veya alıntı işaretlerinden bahsetmeyin.
6. Belirtilen tür ve hedef kitle kombinasyonlarına göre yanıt stilini ve derinliğini ayarlama yeteneği.
7. İçerik doğruluğunu korurken, cevapların özgüllüğünü ve uygulanabilirliğini artırın.

{{gaPrompt}}

## İş Akışı:
1. Derin bir nefes alın ve bu problem üzerinde adım adım çalışın.
2. İlk olarak, verilen dosya içeriğini ve soru türünü analiz edin.
3. Sonra, içerikten anahtar bilgileri çıkarın.
4. Belirli bir tür ve hedef kitle kombinasyonu belirtilmişse, yanıt stilini nasıl ayarlayacağınızı analiz edin.
5. Ardından, soruyla ilgili doğru bir cevap oluşturun, tür-hedef kitle gereksinimlerine göre ifadeyi ayarlayın.
6. Son olarak, cevabın doğruluğunu, ilgisini ve stil uyumluluğunu sağlayın.

## Referans İçerik:

------ Referans İçerik Başlangıç ------
{{text}}
------ Referans İçerik Bitiş ------

## Soru
{{question}}

## Kısıtlamalar:
1. Cevap verilen içeriğe dayalı olmalıdır.
2. Cevap doğru ve soruyla ilgili olmalı, uydurulmuş bilgiye izin verilmez.
3. Cevap kapsamlı ve ayrıntılı olmalı, tüm gerekli bilgileri içermeli ve büyük dil modellerinin ince ayar eğitiminde kullanıma uygun olmalıdır.
4. Cevap 'referansa göre/dayanarak/literatürde bahsedilen' gibi herhangi bir referans ifade içermemeli, yalnızca nihai sonuçları sunmalıdır.
5. Bir tür ve hedef kitle kombinasyonu belirtilmişse, içerik doğruluğunu korurken ifade stili ve derinliği ayarlanmalıdır.
6. Cevap doğrudan soruyu ele almalı, doğruluğunu ve mantığını sağlamalıdır.
{{templatePrompt}}
{{outputFormatPrompt}}
`;

export async function getEnhancedAnswerPrompt(
  language,
  { text, question, activeGaPair = null, questionTemplate },
  projectId = null
) {
  const gaPromptText = getGAPrompt(language, { activeGaPair });
  const { templatePrompt, outputFormatPrompt } = getQuestionTemplate(questionTemplate, language);
  const result = await processPrompt(
    language,
    'enhancedAnswer',
    'ENHANCED_ANSWER_PROMPT',
    { zh: ENHANCED_ANSWER_PROMPT, en: ENHANCED_ANSWER_PROMPT_EN, tr: ENHANCED_ANSWER_PROMPT_TR },
    { gaPrompt: gaPromptText, text, question, templatePrompt, outputFormatPrompt },
    projectId
  );
  return result;
}

export const GA_PROMPT = `
## 特殊要求 - 体裁与受众适配(MGA)：
根据以下体裁与受众组合，调整你的回答风格和深度：

**当前体裁**: {{genre}}
**目标受众**: {{audience}}

请确保：
1. 答案的组织、风格、详略程度和语言应完全符合「{{genre}}」的要求。
2. 答案应考虑到「{{audience}}」的理解能力和知识背景，力求清晰易懂。
3. 用词选择和解释详细程度匹配目标受众的知识背景。
4. 保持内容的准确性和专业性，同时增强针对性。
5. 如果{{genre}}或{{audience}}暗示需要，答案可以适当包含解释、示例或步骤。
6. 答案应直接回应问题，确保问答的逻辑性和连贯性，不要包含无关信息或引用标记如GA对中提到的内容防止污染数据生成的效果。
`;

export const GA_PROMPT_EN = `
## Special Requirements - Genre & Audience Adaptation (MGA):
Adjust your response style and depth according to the following genre and audience combination:

**Current Genre**: {{genre}}
**Target Audience**: {{audience}}

Please ensure:
1. The organization, style, level of detail, and language of the answer should fully comply with the requirements of "{{genre}}".
2. The answer should consider the comprehension ability and knowledge background of "{{audience}}", striving for clarity and ease of understanding.
3. Word choice and explanation detail match the target audience's knowledge background.
4. Maintain content accuracy and professionalism while enhancing specificity.
5. If "{{genre}}" or "{{audience}}" suggests the need, the answer can appropriately include explanations, examples, or steps.
6. The answer should directly address the question, ensuring the logic and coherence of the Q&A. It should not include irrelevant information or citation marks, such as content mentioned in GA pairs, to prevent contaminating the data generation results.
`;

export const GA_PROMPT_TR = `
## Özel Gereksinimler - Tür ve Hedef Kitle Uyarlaması (MGA):
Aşağıdaki tür ve hedef kitle kombinasyonuna göre yanıt tarzınızı ve derinliğinizi ayarlayın:

**Mevcut Tür**: {{genre}}
**Hedef Kitle**: {{audience}}

Lütfen şunları sağlayın:
1. Yanıtın organizasyonu, stili, ayrıntı düzeyi ve dili "{{genre}}" gereksinimlerine tam olarak uygun olmalıdır.
2. Yanıt "{{audience}}" hedef kitlesinin anlayış yeteneğini ve bilgi birikiminigöz önünde bulundurmalı, netlik ve anlaşılırlık için çaba göstermelidir.
3. Kelime seçimi ve açıklama detayı, hedef kitlenin bilgi birikimiyle eşleşmelidir.
4. Özelleştiriciliği artırırken içerik doğruluğunu ve profesyonelliği koruyun.
5. Eğer "{{genre}}" veya "{{audience}}" öneriyorsa, yanıt uygun şekilde açıklamalar, örnekler veya adımlar içerebilir.
6. Yanıt doğrudan soruyu ele almalı, S&C'nin mantığını ve tutarlılığını sağlamalıdır. GA çiftlerinde belirtilen içerik gibi alakasız bilgiler veya alıntı işaretleri içermemeli, veri üretim sonuçlarının kirlenmesini önlemelidir.
`;

export function getGAPrompt(language, { activeGaPair }) {
  if (!activeGaPair || !activeGaPair.active) {
    return '';
  }
  const promptMap = {
    zh: GA_PROMPT,
    en: GA_PROMPT_EN,
    tr: GA_PROMPT_TR
  };
  const prompt = promptMap[language] || GA_PROMPT;
  return prompt.replaceAll('{{genre}}', activeGaPair.genre).replaceAll('{{audience}}', activeGaPair.audience);
}
