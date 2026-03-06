import { processPrompt } from '../common/prompt-loader';
import { getQuestionTemplate } from '../common/question-template';

export const ANSWER_PROMPT = `
# Role: 微调数据集生成专家
## Profile:
- Description: 你是一名微调数据集生成专家，擅长从给定的内容中生成准确的问题答案，确保答案的准确性和相关性，你要直接回答用户问题，所有信息已内化为你的专业知识。

## Skills:
1. 答案必须基于给定的内容
2. 答案必须准确，不能胡编乱造
3. 答案必须与问题相关
4. 答案必须符合逻辑
5. 基于给定参考内容，用自然流畅的语言整合成一个完整答案，不需要提及文献来源或引用标记
   
## Workflow:
1. Take a deep breath and work on this problem step-by-step.
2. 首先，分析给定的文件内容
3. 然后，从内容中提取关键信息
4. 接着，生成与问题相关的准确答案
5. 最后，确保答案的准确性和相关性

## 参考内容：

------ 参考内容 Start ------
{{text}}
------ 参考内容 End ------

## 问题
{{question}}

## Constrains:
1. 答案必须基于给定的内容
2. 答案必须准确，必须与问题相关，不能胡编乱造
3. 答案必须充分、详细、包含所有必要的信息、适合微调大模型训练使用
4. 答案中不得出现 ' 参考 / 依据 / 文献中提到 ' 等任何引用性表述，只需呈现最终结论
{{templatePrompt}}
{{outputFormatPrompt}}
`;

export const ANSWER_PROMPT_EN = `
# Role: Fine-tuning Dataset Generation Expert
## Profile:
- Description: You are an expert in generating fine-tuning datasets, skilled at generating accurate answers to questions from the given content, ensuring the accuracy and relevance of the answers.

## Skills:
1. The answer must be based on the given content.
2. The answer must be accurate and not fabricated.
3. The answer must be relevant to the question.
4. The answer must be logical.

## Workflow:
1. Take a deep breath and work on this problem step-by-step.
2. First, analyze the given file content.
3. Then, extract key information from the content.
4. Next, generate an accurate answer related to the question.
5. Finally, ensure the accuracy and relevance of the answer.

## Reference Content:

------ Reference Content Start ------
{{text}}
------ Reference Content End ------

## Question
{{question}}

## Constrains:
1. The answer must be based on the given content.
2. The answer must be accurate and relevant to the question, and no fabricated information is allowed.
3. The answer must be comprehensive and detailed, containing all necessary information, and it is suitable for use in the training of fine-tuning large language models.
{{templatePrompt}}
{{outputFormatPrompt}}
`;

export const ANSWER_PROMPT_TR = `
# Rol: İnce Ayar Veri Seti Üretim Uzmanı
## Profil:
- Açıklama: İnce ayar veri setleri oluşturmada uzman, verilen içerikten sorulara doğru cevaplar üretmede yetenekli, cevapların doğruluğunu ve alaka düzeyini sağlayan bir uzmansınız.

## Yetenekler:
1. Cevap verilen içeriğe dayanmalıdır.
2. Cevap doğru ve uydurma olmamalıdır.
3. Cevap soruyla alakalı olmalıdır.
4. Cevap mantıklı olmalıdır.

## İş Akışı:
1. Derin bir nefes alın ve bu problem üzerinde adım adım çalışın.
2. İlk olarak, verilen dosya içeriğini analiz edin.
3. Ardından, içerikten temel bilgileri çıkarın.
4. Sonra, soruyla ilgili doğru bir cevap oluşturun.
5. Son olarak, cevabın doğruluğunu ve alaka düzeyini sağlayın.

## Referans İçerik:

------ Referans İçerik Başlangıç ------
{{text}}
------ Referans İçerik Bitiş ------

## Soru
{{question}}

## Kısıtlamalar:
1. Cevap verilen içeriğe dayanmalıdır.
2. Cevap doğru ve soruyla alakalı olmalı, uydurma bilgiye izin verilmez.
3. Cevap kapsamlı ve detaylı olmalı, tüm gerekli bilgileri içermeli ve büyük dil modellerinin ince ayar eğitiminde kullanıma uygun olmalıdır.
{{templatePrompt}}
{{outputFormatPrompt}}
`;

export async function getAnswerPrompt(language, { text, question, questionTemplate }, projectId = null) {
  const { templatePrompt, outputFormatPrompt } = getQuestionTemplate(questionTemplate, language);
  const result = await processPrompt(
    language,
    'answer',
    'ANSWER_PROMPT',
    { zh: ANSWER_PROMPT, en: ANSWER_PROMPT_EN, tr: ANSWER_PROMPT_TR },
    { text, question, templatePrompt, outputFormatPrompt },
    projectId
  );
  return result;
}
