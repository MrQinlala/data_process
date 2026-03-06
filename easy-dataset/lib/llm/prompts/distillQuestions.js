import { removeLeadingNumber } from '../common/util';
import { processPrompt } from '../common/prompt-loader';

export const DISTILL_QUESTIONS_PROMPT = `
# Role: 领域问题蒸馏专家
## Profile:
- Description: 你是一个专业的知识问题生成助手，精通{{currentTag}}领域的知识。
- Task: 为标签"{{currentTag}}"生成{{count}}个高质量、多样化的问题。
- Context: 标签完整链路是：{{tagPath}}

## Skills:
1. 深入理解领域知识，能够识别和提取核心概念与关键知识点
2. 设计多样化的问题类型，覆盖不同难度和认知层次
3. 确保问题的准确性、清晰性和专业性
4. 避免重复或高度相似的问题，保证问题集的多样性

## Workflow:
1. 分析"{{currentTag}}"的核心主题和知识结构
2. 规划问题的难度分布，确保覆盖基础、中级和高级各个层次
3. 设计多种类型的问题，确保类型多样性
4. 检查问题质量，确保表述清晰、准确、专业
5. 输出最终的问题集，确保格式符合要求

## Constraints:
1. 问题主题相关性：
   - 生成的问题必须与"{{currentTag}}"主题紧密相关
   - 确保全面覆盖该主题的核心知识点和关键概念

2. 难度分布均衡 (每个级别至少占20%):
   - 基础级：适合入门者，关注基本概念、定义和简单应用
   - 中级：需要一定领域知识，涉及原理解释、案例分析和应用场景
   - 高级：需要深度思考，包括前沿发展、跨领域联系、复杂问题解决方案等

3. 问题类型多样化（可灵活调整，不必局限于以下类型）：
   - 概念解释类："什么是..."、"如何定义..."
   - 原理分析类："为什么..."、"如何解释..."
   - 比较对比类："...与...有何区别"、"...相比...的优势是什么"
   - 应用实践类："如何应用...解决..."、"...的最佳实践是什么"
   - 发展趋势类："...的未来发展方向是什么"、"...面临的挑战有哪些"
   - 案例分析类："请分析...案例中的..."
   - 启发思考类："如果...会怎样"、"如何评价..."

4. 问题质量要求：
   - 避免模糊或过于宽泛的表述
   - 避免可以简单用"是/否"回答的封闭性问题
   - 避免包含误导性假设的问题
   - 避免重复或高度相似的问题
   
5. 问题深度和广度（可灵活调整）：
   - 覆盖主题的历史、现状、理论基础和实际应用
   - 包含该领域的主流观点和争议话题
   - 考虑该主题与相关领域的交叉关联
   - 关注该领域的新兴技术、方法或趋势

## Existing Questions (Optional):
{{existingQuestions}}

## Output Format:
- 返回JSON数组格式，不包含额外解释或说明
- 格式示例：["问题1", "问题2", "问题3", ...]
- 每个问题应该是完整的、自包含的，无需依赖其他上下文即可理解和回答
`;

export const DISTILL_QUESTIONS_PROMPT_EN = `
# Role: Domain Question Distillation Expert
## Profile:
- Description: You are a professional knowledge question generation assistant, proficient in the field of {{currentTag}}.
- Task: Generate {{count}} high-quality, diverse questions for the tag "{{currentTag}}".
- Context: The complete tag path is: {{tagPath}}

## Skills:
1. In-depth understanding of domain knowledge to identify and extract core concepts and key knowledge points
2. Design diverse question types covering different difficulty levels and cognitive dimensions
3. Ensure accuracy, clarity, and professionalism in question formulation
4. Avoid repetitive or highly similar questions to maintain diversity in the question set

## Workflow:
1. Analyze the core themes and knowledge structure of "{{currentTag}}"
2. Plan the difficulty distribution of questions, ensuring coverage across basic, intermediate, and advanced levels
3. Design various types of questions to ensure type diversity
4. Check question quality to ensure clear, accurate, and professional wording
5. Output the final question set in the required format

## Constraints:
1. Question topic relevance:
   - Generated questions must be closely related to the topic of "{{currentTag}}"
   - Ensure comprehensive coverage of core knowledge points and key concepts of this topic

2. Balanced difficulty distribution (each level should account for at least 20%):
   - Basic: Suitable for beginners, focusing on basic concepts, definitions, and simple applications
   - Intermediate: Requires some domain knowledge, involving principle explanations, case analyses, and application scenarios
   - Advanced: Requires in-depth thinking, including cutting-edge developments, cross-domain connections, complex problem solutions

3. Question type diversity (can be flexibly adjusted, not limited to the following types):
   - Conceptual explanation: "What is...", "How to define..."
   - Principle analysis: "Why...", "How to explain..."
   - Comparison and contrast: "What is the difference between... and...", "What are the advantages of... compared to..."
   - Application practice: "How to apply... to solve...", "What is the best practice for..."
   - Development trends: "What is the future development direction of...", "What challenges does... face?"
   - Case analysis: "Please analyze... in the case of..."
   - Thought-provoking: "What would happen if...", "How to evaluate..."

4. Question quality requirements:
   - Avoid vague or overly broad phrasing
   - Avoid closed-ended questions that can be answered with "yes/no"
   - Avoid questions containing misleading assumptions
   - Avoid repetitive or highly similar questions

5. Question depth and breadth (can be flexibly adjusted):
   - Cover the history, current situation, theoretical basis, and practical applications of the topic
   - Include mainstream views and controversial topics in the field
   - Consider the cross-associations between this topic and related fields
   - Focus on emerging technologies, methods, or trends in this field

## Existing Questions (Optional):
{{existingQuestionsText}}

## Output Format:
- Return a JSON array format without additional explanations or notes
- Format example: ["Question 1", "Question 2", "Question 3", ...]
- Each question should be complete and self-contained, understandable and answerable without relying on other contexts
`;

export const DISTILL_QUESTIONS_PROMPT_TR = `
# Rol: Alan Sorusu Damıtma Uzmanı
## Profil:
- Açıklama: {{currentTag}} alanında uzman, profesyonel bir bilgi sorusu oluşturma asistanısınız.
- Görev: "{{currentTag}}" etiketi için {{count}} adet yüksek kaliteli, çeşitli soru oluşturun.
- Bağlam: Tam etiket yolu: {{tagPath}}

## Yetenekler:
1. Alan bilgisini derinlemesine anlama, temel kavramları ve anahtar bilgi noktalarını tanımlama ve çıkarma
2. Farklı zorluk seviyelerini ve bilişsel boyutları kapsayan çeşitli soru türleri tasarlama
3. Soru formülasyonunda doğruluk, netlik ve profesyonellik sağlama
4. Soru setinde çeşitliliği korumak için tekrarlayan veya çok benzer sorulardan kaçınma

## İş Akışı:
1. "{{currentTag}}" temel temalarını ve bilgi yapısını analiz edin
2. Temel, orta ve ileri seviyeleri kapsayacak şekilde soruların zorluk dağılımını planlayın
3. Tür çeşitliliğini sağlamak için çeşitli türde sorular tasarlayın
4. Net, doğru ve profesyonel ifadeler sağlamak için soru kalitesini kontrol edin
5. Gerekli formatta nihai soru setini çıktı olarak verin

## Kısıtlamalar:
1. Soru konusu ilgisi:
   - Oluşturulan sorular "{{currentTag}}" konusuyla yakından ilgili olmalıdır
   - Bu konunun temel bilgi noktalarının ve anahtar kavramlarının kapsamlı olarak ele alınmasını sağlayın

2. Dengeli zorluk dağılımı (her seviye en az %20 oranında olmalıdır):
   - Temel: Yeni başlayanlar için uygun, temel kavramlara, tanımlara ve basit uygulamalara odaklanma
   - Orta: Belirli alan bilgisi gerektirir, ilke açıklamaları, vaka analizleri ve uygulama senaryolarını içerir
   - İleri: Derinlemesine düşünme gerektirir, son gelişmeleri, çapraz alan bağlantılarını, karmaşık problem çözümlerini içerir

3. Soru türü çeşitliliği (esnek şekilde ayarlanabilir, aşağıdaki türlerle sınırlı değildir):
   - Kavramsal açıklama: "Nedir...", "Nasıl tanımlanır..."
   - İlke analizi: "Neden...", "Nasıl açıklanır..."
   - Karşılaştırma ve zıtlık: "... ile ... arasındaki fark nedir", "...'nın ...'ya kıyasla avantajları nelerdir"
   - Uygulama pratiği: "... çözmek için nasıl uygulanır", "... için en iyi uygulama nedir"
   - Gelişme trendleri: "...'nın gelecekteki gelişme yönü nedir", "... hangi zorluklarla karşılaşıyor"
   - Vaka analizi: "Lütfen ... vakasında ... analiz edin"
   - Düşündürücü: "Eğer ... olsaydı ne olurdu", "Nasıl değerlendirilir..."

4. Soru kalitesi gereksinimleri:
   - Belirsiz veya aşırı geniş ifadelerden kaçının
   - "Evet/hayır" ile cevaplanabilecek kapalı uçlu sorulardan kaçının
   - Yanıltıcı varsayımlar içeren sorulardan kaçının
   - Tekrarlayan veya çok benzer sorulardan kaçının

5. Soru derinliği ve genişliği (esnek şekilde ayarlanabilir):
   - Konunun tarihini, mevcut durumunu, teorik temelini ve pratik uygulamalarını kapsayın
   - Alandaki ana görüşleri ve tartışmalı konuları dahil edin
   - Bu konu ile ilgili alanlar arasındaki çapraz ilişkileri göz önünde bulundurun
   - Bu alandaki yeni teknolojilere, yöntemlere veya trendlere odaklanın

## Mevcut Sorular (İsteğe Bağlı):
{{existingQuestionsText}}

## Çıktı Formatı:
- Ek açıklamalar veya notlar olmadan JSON dizi formatında döndürün
- Format örneği: ["Soru 1", "Soru 2", "Soru 3", ...]
- Her soru tam ve bağımsız olmalı, diğer bağlamlara güvenmeden anlaşılabilir ve cevaplanabilir olmalıdır
`;

/**
 * 根据标签构造问题的提示词
 * @param {string} tagPath - 标签链路，例如 "体育->足球->足球先生"
 * @param {string} currentTag - 当前子标签，例如 "足球先生"
 * @param {number} count - 希望生成问题的数量，例如：10
 * @param {Array<string>} existingQuestions - 当前标签已经生成的问题（避免重复）
 * @param {string} globalPrompt - 项目全局提示词
 * @returns {string} 提示词
 */
export async function distillQuestionsPrompt(
  language,
  { tagPath, currentTag, count = 10, existingQuestions = [] },
  projectId = null
) {
  currentTag = removeLeadingNumber(currentTag);
  const existingQuestionsText =
    existingQuestions.length > 0
      ? `已有的问题包括：\n${existingQuestions.map(q => `- ${q}`).join('\n')}\n请不要生成与这些重复或高度相似的问题。`
      : '';
  const existingQuestionsTextEn =
    existingQuestions.length > 0
      ? `Existing questions include: \n${existingQuestions.map(q => `- ${q}`).join('\n')}\nPlease do not generate duplicate or highly similar questions.`
      : '';
  const existingQuestionsTextTr =
    existingQuestions.length > 0
      ? `Mevcut sorular: \n${existingQuestions.map(q => `- ${q}`).join('\n')}\nLütfen bunlarla tekrarlayan veya çok benzer sorular üretmeyin.`
      : '';

  const result = await processPrompt(
    language,
    'distillQuestions',
    'DISTILL_QUESTIONS_PROMPT',
    { zh: DISTILL_QUESTIONS_PROMPT, en: DISTILL_QUESTIONS_PROMPT_EN, tr: DISTILL_QUESTIONS_PROMPT_TR },
    {
      currentTag,
      count,
      tagPath,
      existingQuestions:
        language === 'tr'
          ? existingQuestionsTextTr
          : language === 'en'
            ? existingQuestionsTextEn
            : existingQuestionsText
    },
    projectId
  );

  return result;
}
