/**
 * Genre-Audience (GA) 对生成提示词 (中文版)
 * 基于 MGA (Massive Genre-Audience) 数据增强方法
 */

import { processPrompt } from '../common/prompt-loader';

export const GA_GENERATION_PROMPT = `
# Role: 体裁与受众设计专家
## Profile:
- Description: 你是一名擅长内容分析与创意提炼的专家，能够依据文本内容设计出多样且高质量的 [体裁]-[受众] 组合，以支撑问题生成与风格化回答。
- Output Goal: 生成 5 对独特且互相区分的 [体裁]-[受众] 组合。

## Skills:
1. 深入理解原文的主题、结构、语调与潜在价值。
2. 具备丰富的体裁知识，能够从事实概念、分析推理、评估创造、操作指导等角度设计差异化提问风格。
3. 善于刻画受众画像，涵盖不同年龄、背景、动机与学习需求，避免单一视角。
4. 输出信息清晰、完整，且便于下游系统直接使用。

## Workflow:
1. **文本洞察**：通读原文，分析写作风格、信息密度、可延展方向。
2. **场景构思**：设想至少 5 种学习或探究场景，思考如何在保留核心信息的前提下拓展体裁与受众的多样性。
3. **组合设计**：为每个场景分别生成独立的体裁与对应受众描述，确保两者之间具有明确匹配逻辑。
4. **重复校验**：确认 5 对组合在体裁类型、表达风格、受众画像上均无重复或高度相似项。

## Constraints:
1. 每对组合必须包含详细的体裁标题与 2-3 句描述，突出语言风格、情绪基调、表达形式等要素；禁止使用视觉类体裁（如漫画、视频）。
2. 每个受众需提供 2 句描述，涵盖其背景特征、认知水平、兴趣点与期望目标；需兼顾积极与冷淡受众，体现多元化。
3. 体裁与受众的匹配需自然合理，能够指导后续的问题风格与回答方式。
4. 输出不得包含与原文无关的臆测，不得沿用已有组合模板。
5. 必须严格返回 5 对组合，顺序不限，但禁止出现额外说明文字。

## Output Format:
- 仅返回合法 JSON 数组，数组长度为 5。
- 每个元素包含 \`genre\` 与 \`audience\` 两个对象，均需包含 \`title\` 与 \`description\` 字段。
- 参考结构如下：
\`\`\`
[
  {
    "genre": {"title": "体裁标题", "description": "体裁描述"},
    "audience": {"title": "受众标题", "description": "受众描述"}
  }
]
\`\`\`

## Examples:
- 体裁示例：“深究原因型” —— 描述聚焦于“为什么/如何”类提问，强调逻辑链条与原理阐述。
- 受众示例：“对技术细节好奇的工程师实习生” —— 描述其背景、动机与学习目标。

## Source Text to Analyze:
{{text}}
`;

export const GA_GENERATION_PROMPT_EN = `
# Role: Genre & Audience Design Specialist
## Profile:
- Description: You are an expert in content analysis and creative abstraction, capable of crafting diverse, high-quality [Genre]-[Audience] pairings based on the source text to support question generation and stylized responses.
- Output Goal: Produce 5 distinctive [Genre]-[Audience] pairs with clear differentiation.

## Skills:
1. Derive deep insights about the topic, structure, tone, and potential value of the source text.
2. Possess extensive genre knowledge, spanning factual recall, conceptual understanding, analytical reasoning, evaluative creation, instructional guidance, etc., to design varied questioning styles.
3. Portray audiences across age, expertise, motivation, and engagement levels, ensuring multi-perspective coverage.
4. Communicate clearly and precisely so downstream systems can consume the output directly.

## Workflow:
1. **Text Insight**: Read the passage thoroughly to analyze style, information density, and extensibility.
2. **Scenario Ideation**: Imagine at least 5 learning or inquiry scenarios that broaden genre and audience diversity while preserving core information.
3. **Pair Construction**: For each scenario, create a dedicated genre and a matching audience description with an explicit logical connection.
4. **Redundancy Check**: Ensure all 5 pairs are distinct in genre style, tone, and audience profile with no repetition or near-duplicates.

## Constraints:
1. Each genre must include a title and a 2-3 sentence description emphasizing language style, emotional tone, delivery format, etc.; exclude visual formats (e.g., comics, video).
2. Each audience must include a two-sentence profile describing background traits, knowledge level, motivations, and desired outcomes; represent both enthusiastic and lukewarm audiences to highlight diversity.
3. Genre and audience within each pair must be naturally aligned to guide subsequent question style and answer adaptation.
4. Do not infer content unrelated to the source text or reuse existing pair templates; ensure originality.
5. Return exactly 5 pairs with no additional commentary or formatting beyond the specified JSON structure.

## Output Format:
- Respond with a valid JSON array of length 5.
- Each element must contain \`genre\` and \`audience\` objects, both with \`title\` and \`description\` fields.
- Follow the example structure:
\`\`\`
[
  {
    "genre": {"title": "Genre Title", "description": "Genre description"},
    "audience": {"title": "Audience Title", "description": "Audience description"}
  }
]
\`\`\`

## Examples:
- Genre Example: "Root Cause Analysis" — Focused on "why/how" questioning with logical, principle-driven exploration.
- Audience Example: "Aspiring Engineers Curious About Technical Details" — Highlighting background, motivations, and learning objectives.

## Source Text to Analyze:
{{text}}
`;

export const GA_GENERATION_PROMPT_TR = `
# Rol: Tür ve Hedef Kitle Tasarım Uzmanı
## Profil:
- Açıklama: İçerik analizi ve yaratıcı soyutlama konusunda uzman, soru oluşturma ve stilize yanıtları desteklemek için kaynak metne dayalı çeşitli, yüksek kaliteli [Tür]-[Hedef Kitle] eşleştirmeleri oluşturma yeteneğine sahipsiniz.
- Çıktı Hedefi: Net ayrıma sahip 5 farklı [Tür]-[Hedef Kitle] çifti üretin.

## Yetenekler:
1. Kaynak metnin konusu, yapısı, tonu ve potansiyel değeri hakkında derin içgörüler elde edin.
2. Çeşitli sorgulama stillerini tasarlamak için olgusal hatırlama, kavramsal anlama, analitik akıl yürütme, değerlendirici yaratım, öğretici rehberlik vb. kapsayan geniş tür bilgisine sahip olun.
3. Çok perspektifli kapsama sağlamak için yaş, uzmanlık, motivasyon ve katılım seviyelerinde hedef kitleleri betimleyin.
4. Alt sistemlerin çıktıyı doğrudan tüketebilmesi için net ve kesin iletişim kurun.

## İş Akışı:
1. **Metin İçgörüsü**: Stili, bilgi yoğunluğunu ve genişletilebilirliği analiz etmek için pasajı kapsamlı şekilde okuyun.
2. **Senaryo Fikir Üretimi**: Temel bilgileri koruyarak tür ve hedef kitle çeşitliliğini genişleten en az 5 öğrenme veya araştırma senaryosu hayal edin.
3. **Çift Oluşturma**: Her senaryo için özel bir tür ve açık mantıksal bağlantıya sahip eşleşen hedef kitle açıklaması oluşturun.
4. **Artıklık Kontrolü**: Tür stili, tonu ve hedef kitle profilinde tekrar veya neredeyse çoğaltma olmadan tüm 5 çiftin farklı olduğundan emin olun.

## Kısıtlamalar:
1. Her tür, dil stili, duygusal ton, sunum formatı vb. vurgulayan bir başlık ve 2-3 cümlelik açıklama içermelidir; görsel formatları (örn. çizgi roman, video) hariç tutun.
2. Her hedef kitle, geçmiş özellikleri, bilgi düzeyini, motivasyonları ve istenen sonuçları açıklayan iki cümlelik bir profil içermelidir; çeşitliliği vurgulamak için hem hevesli hem de ilgisiz hedef kitleleri temsil edin.
3. Her çiftteki tür ve hedef kitle, sonraki soru stilini ve cevap uyarlamasını yönlendirmek için doğal olarak hizalanmalıdır.
4. Kaynak metinle ilgisi olmayan içerik çıkarsamayın veya mevcut çift şablonlarını yeniden kullanmayın; özgünlük sağlayın.
5. Belirtilen JSON yapısının ötesinde ek yorum veya biçimlendirme olmadan tam olarak 5 çift döndürün.

## Çıktı Formatı:
- Uzunluğu 5 olan geçerli bir JSON dizisiyle yanıt verin.
- Her öğe, her ikisi de \`title\` ve \`description\` alanlarına sahip \`genre\` ve \`audience\` nesnelerini içermelidir.
- Örnek yapıyı izleyin:
\`\`\`
[
  {
    "genre": {"title": "Tür Başlığı", "description": "Tür açıklaması"},
    "audience": {"title": "Hedef Kitle Başlığı", "description": "Hedef kitle açıklaması"}
  }
]
\`\`\`

## Örnekler:
- Tür Örneği: "Kök Neden Analizi" — Mantıksal, ilke odaklı keşifle "neden/nasıl" sorgulamaya odaklanır.
- Hedef Kitle Örneği: "Teknik Detaylara Meraklı Aday Mühendisler" — Geçmişi, motivasyonları ve öğrenme hedeflerini vurgular.

## Analiz Edilecek Kaynak Metin:
{{text}}
`;

/**
 * 获取 GA 组合生成提示词
 * @param {string} language - 语言标识
 * @param {Object} params - 参数对象
 * @param {string} params.text - 待分析的文本内容
 * @param {string} projectId - 项目ID，用于获取自定义提示词
 * @returns {Promise<string>} - 完整的提示词
 */
export async function getGAGenerationPrompt(language, { text }, projectId = null) {
  const result = await processPrompt(
    language,
    'ga-generation',
    'GA_GENERATION_PROMPT',
    { zh: GA_GENERATION_PROMPT, en: GA_GENERATION_PROMPT_EN, tr: GA_GENERATION_PROMPT_TR },
    { text },
    projectId
  );
  return result;
}
