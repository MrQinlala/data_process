import { processPrompt } from '../common/prompt-loader';

export const LABEL_PROMPT = `
# Role: 领域分类专家 & 知识图谱专家
- Description: 作为一名资深的领域分类专家和知识图谱专家，擅长从文本内容中提取核心主题，构建分类体系，并输出规定 JSON 格式的标签树。

## Skills:
1. 精通文本主题分析和关键词提取
2. 擅长构建分层知识体系
3. 熟练掌握领域分类方法论
4. 具备知识图谱构建能力
5. 精通JSON数据结构

## Goals:
1. 分析书籍目录内容
2. 识别核心主题和关键领域
3. 构建两级分类体系
4. 确保分类逻辑合理
5. 生成规范的JSON输出

## Workflow:
1. 仔细阅读完整的书籍目录内容
2. 提取关键主题和核心概念
3. 对主题进行分组和归类
4. 构建一级领域标签
5. 为适当的一级标签添加二级标签
6. 检查分类逻辑的合理性
7. 生成符合格式的JSON输出

## 需要分析的目录
{{text}}

## 限制
1. 一级领域标签数量5-10个
2. 二级领域标签数量1-10个
3. 最多两层分类层级
4. 分类必须与原始目录内容相关
5. 输出必须符合指定 JSON 格式，不要输出 JSON 外其他任何不相关内容
6. 标签的名字最多不要超过 6 个字
7. 在每个标签前加入序号（序号不计入字数）

## OutputFormat:
\`\`\`json
[
  {
    "label": "1 一级领域标签",
    "child": [
      {"label": "1.1 二级领域标签1"},
      {"label": "1.2 二级领域标签2"}
    ]
  },
  {
    "label": "2 一级领域标签(无子标签)"
  }
]
\`\`\`
`;

export const LABEL_PROMPT_EN = `
# Role: Domain Classification Expert & Knowledge Graph Expert
- Description: As a senior domain classification expert and knowledge graph expert, you are skilled at extracting core themes from text content, constructing classification systems, and performing knowledge categorization and labeling.

## Skills:
1. Proficient in text theme analysis and keyword extraction.
2. Good at constructing hierarchical knowledge systems.
3. Skilled in domain classification methodologies.
4. Capable of building knowledge graphs.
5. Proficient in JSON data structures.

## Goals:
1. Analyze the content of the book catalog.
2. Identify core themes and key domains.
3. Construct a two - level classification system.
4. Ensure the classification logic is reasonable.
5. Generate a standardized JSON output.

## Workflow:
1. Carefully read the entire content of the book catalog.
2. Extract key themes and core concepts.
3. Group and categorize the themes.
4. Construct primary domain labels (ensure no more than 10).
5. Add secondary labels to appropriate primary labels (no more than 5 per group).
6. Check the rationality of the classification logic.
7. Generate a JSON output that conforms to the format.

## Catalog to be analyzed
    {{text}}

## Constraints
1. The number of primary domain labels should be between 5 and 10.
2. The number of secondary domain labels ≤ 5 per primary label.
3. There should be at most two classification levels.
4. The classification must be relevant to the original catalog content.
5. The output must conform to the specified JSON format.
6. The names of the labels should not exceed 6 characters.
7. Do not output any content other than the JSON.
8. Add a serial number before each label (the serial number does not count towards the character limit).
9. Use English


## OutputFormat:
\`\`\`json
[
  {
    "label": "1 Primary Domain Label",
    "child": [
      {"label": "1.1 Secondary Domain Label 1"},
      {"label": "1.2 Secondary Domain Label 2"}
    ]
  },
  {
    "label": "2 Primary Domain Label (No Sub - labels)"
  }
]
\`\`\`
    `;

export const LABEL_PROMPT_TR = `
# Rol: Alan Sınıflandırma Uzmanı & Bilgi Grafiği Uzmanı
- Açıklama: Kıdemli bir alan sınıflandırma uzmanı ve bilgi grafiği uzmanı olarak, metin içeriğinden temel temaları çıkarmada, sınıflandırma sistemleri oluşturmada ve bilgi kategorizasyonu ve etiketlemesinde yeteneklisiniz.

## Yetenekler:
1. Metin tema analizi ve anahtar kelime çıkarımında yetkin.
2. Hiyerarşik bilgi sistemleri oluşturmada iyi.
3. Alan sınıflandırma metodolojilerinde yetenekli.
4. Bilgi grafikleri oluşturma yeteneği.
5. JSON veri yapılarında yetkin.

## Hedefler:
1. Kitap kataloğunun içeriğini analiz edin.
2. Temel temaları ve anahtar alanları tanımlayın.
3. İki seviyeli bir sınıflandırma sistemi oluşturun.
4. Sınıflandırma mantığının makul olduğundan emin olun.
5. Standart bir JSON çıktısı oluşturun.

## İş Akışı:
1. Kitap kataloğunun tüm içeriğini dikkatlice okuyun.
2. Temel temaları ve çekirdek kavramları çıkarın.
3. Temaları gruplandırın ve kategorize edin.
4. Birincil alan etiketleri oluşturun (10'dan fazla olmadığından emin olun).
5. Uygun birincil etiketlere ikincil etiketler ekleyin (grup başına 5'ten fazla olmayacak şekilde).
6. Sınıflandırma mantığının mantıklılığını kontrol edin.
7. Formata uygun bir JSON çıktısı oluşturun.

## Analiz edilecek katalog
    {{text}}

## Kısıtlamalar
1. Birincil alan etiketi sayısı 5 ile 10 arasında olmalıdır.
2. İkincil alan etiketi sayısı ≤ birincil etiket başına 5.
3. En fazla iki sınıflandırma seviyesi olmalıdır.
4. Sınıflandırma orijinal katalog içeriğiyle alakalı olmalıdır.
5. Çıktı belirtilen JSON formatına uygun olmalıdır.
6. Etiket adları 6 karakteri geçmemelidir.
7. JSON dışında başka herhangi bir içerik çıktılamayın.
8. Her etiketin önüne bir seri numarası ekleyin (seri numarası karakter sınırına dahil değildir).
9. Türkçe kullanın


## ÇıktıFormatı:
\`\`\`json
[
  {
    "label": "1 Birincil Alan Etiketi",
    "child": [
      {"label": "1.1 İkincil Alan Etiketi 1"},
      {"label": "1.2 İkincil Alan Etiketi 2"}
    ]
  },
  {
    "label": "2 Birincil Alan Etiketi (Alt etiket yok)"
  }
]
\`\`\`
    `;

/**
 * 获取领域标签生成提示词
 * @param {string} language - 语言标识
 * @param {Object} params - 参数对象
 * @param {string} params.text - 待分析的目录文本
 * @param {string} projectId - 项目ID，用于获取自定义提示词
 * @returns {Promise<string>} - 完整的提示词
 */
export async function getLabelPrompt(language, { text }, projectId = null) {
  const result = await processPrompt(
    language,
    'label',
    'LABEL_PROMPT',
    { zh: LABEL_PROMPT, en: LABEL_PROMPT_EN, tr: LABEL_PROMPT_TR },
    { text },
    projectId
  );
  return result;
}
