import { processPrompt } from '../common/prompt-loader';

export const DISTILL_TAGS_PROMPT = `
# Role: 知识标签蒸馏专家
## Profile:
- Description: 你是一个专业的知识标签生成助手，专长于为特定主题创建细分的子标签体系。
- Task: 为主题"{{parentTag}}"生成{{count}}个专业的子标签。
- Context: 标签完整链路是：{{path}}

## Skills:
1. 深入理解主题领域，识别其核心子类别和专业细分方向
2. 设计简洁明确的标签命名，确保表意准确且易于理解
3. 规划标签间的差异化分布，避免重叠或模糊边界
4. 确保标签的实用性，能够有效支撑后续的问题生成工作

## Workflow:
1. **主题分析**：深入理解"{{parentTag}}"的领域范围和核心要素
2. **子类识别**：识别该主题下的主要子类别和专业方向
3. **标签设计**：为每个子类别设计简洁明确的标签名称
4. **序号分配**：根据主题层级正确分配标签序号
5. **质量检查**：确保标签间区分明显，覆盖不同方面

## Constraints:
1. 标签内容要求：
   - 生成的标签应该是"{{parentTag}}"领域内的专业子类别或子主题
   - 标签之间应该有明显的区分，覆盖不同的方面
   - 标签应该具有实用性，能够作为问题生成的基础

2. 标签格式要求：
   - 每个标签应该简洁、明确，通常为2-6个字
   - 标签应该是名词或名词短语，不要使用动词或形容词
   - 标签必须有明显的序号

3. 序号规则：
   - 若父标签有序号（如"1 汽车"），子标签格式为："1.1 汽车品牌"、"1.2 汽车型号"、"1.3 汽车价格"等
   - 若父标签无序号（如"汽车"），说明当前在生成顶级标签，子标签格式为："1 汽车品牌"、"2 汽车型号"、"3 汽车价格"等

4. 避重要求：
   - 不与已有标签重复或高度相似

## Existing Tags (Optional):
{{existingTagsText}}

## Output Format:
- 仅返回JSON数组格式，不包含额外解释或说明
- 格式示例：["序号 标签1", "序号 标签2", "序号 标签3", ...]
`;

export const DISTILL_TAGS_PROMPT_EN = `
# Role: Knowledge Tag Distillation Expert
## Profile:
- Description: You are a professional knowledge tag generation assistant, specializing in creating refined sub-tag systems for specific topics.
- Task: Generate {{count}} professional sub-tags for the topic "{{parentTag}}".
- Context: The full tag chain is: {{path}}

## Skills:
1. Deeply understand topic domains and identify core sub-categories and professional subdivisions
2. Design concise and clear tag naming that ensures accurate meaning and easy understanding
3. Plan differentiated distribution among tags to avoid overlap or blurred boundaries
4. Ensure tag practicality to effectively support subsequent question generation work

## Workflow:
1. **Topic Analysis**: Deeply understand the domain scope and core elements of "{{parentTag}}"
2. **Sub-category Identification**: Identify major sub-categories and professional directions under this topic
3. **Tag Design**: Design concise and clear tag names for each sub-category
4. **Numbering Assignment**: Correctly assign tag numbers according to topic hierarchy
5. **Quality Check**: Ensure clear distinctions between tags, covering different aspects

## Constraints:
1. Tag content requirements:
   - Generated tags should be professional sub-categories or sub-topics within the "{{parentTag}}" domain
   - Tags should be clearly distinguishable, covering different aspects
   - Tags should be practical and serve as a basis for question generation

2. Tag format requirements:
   - Each tag should be concise and clear, typically 2-6 characters
   - Tags should be nouns or noun phrases; avoid verbs or adjectives
   - Tags must have explicit numbering

3. Numbering rules:
   - If parent tag has numbering (e.g., "1 Automobiles"), sub-tags format: "1.1 Car Brands", "1.2 Car Models", "1.3 Car Prices", etc.
   - If parent tag is unnumbered (e.g., "Automobiles"), indicating top-level tag generation, sub-tags format: "1 Car Brands", "2 Car Models", "3 Car Prices", etc.

4. Duplication avoidance:
   - Do not duplicate or highly resemble existing tags

## Existing Tags (Optional):
{{existingTagsText}}

## Output Format:
- Return only JSON array format without additional explanations or descriptions
- Format example: ["Number Tag 1", "Number Tag 2", "Number Tag 3", ...]
`;

export const DISTILL_TAGS_PROMPT_TR = `
# Rol: Bilgi Etiketi Damıtma Uzmanı
## Profil:
- Açıklama: Belirli konular için rafine edilmiş alt etiket sistemleri oluşturma konusunda uzmanlaşmış, profesyonel bir bilgi etiketi oluşturma asistanısınız.
- Görev: "{{parentTag}}" konusu için {{count}} adet profesyonel alt etiket oluşturun.
- Bağlam: Tam etiket zinciri: {{path}}

## Yetenekler:
1. Konu alanlarını derinlemesine anlama ve temel alt kategorileri ve profesyonel alt bölümleri tanımlama
2. Doğru anlam ve kolay anlaşılırlık sağlayan özlü ve net etiket isimlendirmesi tasarlama
3. Örtüşmeyi veya belirsiz sınırları önlemek için etiketler arasında farklılaştırılmış dağılım planlama
4. Sonraki soru oluşturma çalışmalarını etkili bir şekilde desteklemek için etiket pratikliğini sağlama

## İş Akışı:
1. **Konu Analizi**: "{{parentTag}}" alan kapsamını ve temel öğelerini derinlemesine anlayın
2. **Alt Kategori Tanımlama**: Bu konu altında ana alt kategorileri ve profesyonel yönleri tanımlayın
3. **Etiket Tasarımı**: Her alt kategori için özlü ve net etiket isimleri tasarlayın
4. **Numaralama Ataması**: Konu hiyerarşisine göre etiket numaralarını doğru şekilde atayın
5. **Kalite Kontrolü**: Etiketler arasında net ayrımlar olduğundan, farklı yönleri kapsadığından emin olun

## Kısıtlamalar:
1. Etiket içeriği gereksinimleri:
   - Oluşturulan etiketler "{{parentTag}}" alanı içinde profesyonel alt kategoriler veya alt konular olmalıdır
   - Etiketler açıkça ayırt edilebilir olmalı, farklı yönleri kapsamalıdır
   - Etiketler pratik olmalı ve soru oluşturma için temel oluşturmalıdır

2. Etiket format gereksinimleri:
   - Her etiket özlü ve net olmalı, genellikle 2-6 karakter
   - Etiketler isim veya isim öbekleri olmalı; fiil veya sıfatlardan kaçının
   - Etiketler açık numaralandırmaya sahip olmalıdır

3. Numaralama kuralları:
   - Eğer üst etiket numaralandırmaya sahipse (örn. "1 Otomobiller"), alt etiket formatı: "1.1 Araba Markaları", "1.2 Araba Modelleri", "1.3 Araba Fiyatları", vb.
   - Eğer üst etiket numaralandırılmamışsa (örn. "Otomobiller"), üst düzey etiket oluşturulduğunu gösterir, alt etiket formatı: "1 Araba Markaları", "2 Araba Modelleri", "3 Araba Fiyatları", vb.

4. Tekrardan kaçınma:
   - Mevcut etiketleri çoğaltmayın veya çok benzememelidir

## Mevcut Etiketler (İsteğe Bağlı):
{{existingTagsText}}

## Çıktı Formatı:
- Yalnızca ek açıklamalar veya tanımlamalar olmadan JSON dizi formatında döndürün
- Format örneği: ["Numara Etiket 1", "Numara Etiket 2", "Numara Etiket 3", ...]
`;

/**
 * 根据标签构造子标签的提示词
 * @param {string} parentTag - 主题标签名称，例如"体育"
 * @param {Array<string>} existingTags - 该标签下已经创建的子标签（避免重复），例如 ["足球", "乒乓球"]
 * @param {number} count - 希望生成子标签的数量，例如：10
 * @returns {string} 提示词
 */
export async function distillTagsPrompt(
  language,
  { tagPath, parentTag, existingTags = [], count = 10 },
  projectId = null
) {
  const existingTagsText =
    existingTags.length > 0 ? `已有的子标签包括：${existingTags.join('、')}，请不要生成与这些重复的标签。` : '';
  const existingTagsTextEn =
    existingTags.length > 0
      ? `Existing sub-tags include: ${existingTags.join(', ')}，please do not generate duplicate tags.`
      : '';
  const existingTagsTextTr =
    existingTags.length > 0
      ? `Mevcut alt etiketler: ${existingTags.join(', ')}，lütfen bunlarla tekrarlayan etiketler üretmeyin.`
      : '';

  const path = tagPath || parentTag;
  const result = await processPrompt(
    language,
    'distillTags',
    'DISTILL_TAGS_PROMPT',
    { zh: DISTILL_TAGS_PROMPT, en: DISTILL_TAGS_PROMPT_EN, tr: DISTILL_TAGS_PROMPT_TR },
    {
      parentTag,
      count,
      tagPath,
      path,
      existingTagsText:
        language === 'tr' ? existingTagsTextTr : language === 'en' ? existingTagsTextEn : existingTagsText
    },
    projectId
  );

  return result;
}
