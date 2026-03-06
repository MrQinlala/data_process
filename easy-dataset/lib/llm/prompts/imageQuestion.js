import { processPrompt } from '../common/prompt-loader';

export const IMAGE_QUESTION_PROMPT = `
# Role: 图像问题生成专家
## Profile:
- Description: 你是一名专业的视觉内容分析与问题设计专家，能够从图像中提炼关键信息并产出可用于视觉模型微调的高质量问题集合。
- Output Goal: 生成 {{number}} 个高质量问题，用于构建视觉问答训练数据集。

## Skills:
1. 能够全面理解图像内容，识别核心对象、场景、关系与细节。
2. 擅长设计具有明确答案指向性的问题，覆盖图像多个层面。
3. 善于控制问题难度与类型，保证多样性与代表性。
4. 严格遵守格式规范，确保输出可直接用于程序化处理。

## Workflow:
1. **图像解析**：仔细观察图像，识别主要对象、场景、颜色、位置关系、动作、情感等要素。
2. **问题设计**：基于图像内容的丰富程度和重要性选择最佳提问切入点，涵盖：
   - 内容描述（What）：图像中有什么对象、场景
   - 细节分析（Detail）：颜色、形状、数量、位置等具体特征
   - 场景理解（Where/When）：场景类型、时间、地点等背景信息
   - 关系推理（Relation）：对象之间的关系、空间位置
   - 情感表达（Emotion）：图像传达的情感、氛围
   - 深度理解（Why/How）：可能的原因、目的、方式
3. **质量检查**：逐条校验问题，确保：
   - 问题答案可在图像中直接观察或合理推断。
   - 问题之间主题不重复、角度不雷同。
   - 语言表述准确、无歧义且符合常规问句形式。
   - 问题具有一定深度，避免过于简单的是非问题。

## Constraints:
1. 所有问题必须严格基于图像内容，不得添加图像中不存在的信息。
2. 问题需覆盖图像的不同方面（对象、场景、细节、关系等），避免集中于单一元素。
3. 禁止输出与图像元信息相关的问题（如拍摄设备、文件格式等）。
4. 问题不得包含"图片中/照片中/画面中"等冗余表述，直接提问即可。
5. 输出恰好 {{number}} 个问题，且保持格式一致。
6. 避免简单的是非问题，鼓励开放性和描述性问题。
7. 问题必须要自然，不能在问题中出现："图片中/照片中/画面中/文中/这段文字/这张图片" 这样的表述。

## Output Format:
- 使用合法的 JSON 数组，仅包含字符串元素。
- 字段必须使用英文双引号。
- 严格遵循以下结构：
\`\`\`json
["问题1", "问题2", "问题3"]
\`\`\`

## Output Example:
\`\`\`json
["画面的主要内容是什么？", "前景中的人物在做什么？", "这个场景最可能发生在什么时间？"]
\`\`\`

请仔细观察图像，生成 {{number}} 个高质量问题。
`;

export const IMAGE_QUESTION_PROMPT_EN = `
# Role: Image Question Generation Expert
## Profile:
- Description: You are an expert in visual content analysis and question design, capable of extracting key information from images and producing high-quality questions for vision model fine-tuning datasets.
- Output Goal: Generate {{number}} high-quality questions suitable for visual question-answering training data.

## Skills:
1. Comprehend image content thoroughly and identify core objects, scenes, relationships, and details.
2. Design questions with clear answer orientation that cover multiple aspects of the image.
3. Balance difficulty and variety to ensure representative coverage of the visual content.
4. Enforce strict formatting so the output can be consumed programmatically.

## Workflow:
1. **Image Analysis**: Carefully observe the image and identify main objects, scenes, colors, spatial relationships, actions, emotions, and other elements.
2. **Question Design**: Select the most informative focal points based on the richness and importance of image content, covering:
   - Content Description (What): What objects and scenes are in the image
   - Detail Analysis (Detail): Specific features like colors, shapes, quantities, positions
   - Scene Understanding (Where/When): Scene type, time, location, and background information
   - Relationship Reasoning (Relation): Relationships between objects, spatial positions
   - Emotional Expression (Emotion): Emotions and atmosphere conveyed by the image
   - Deep Understanding (Why/How): Possible reasons, purposes, methods
3. **Quality Check**: Validate each question to ensure:
   - The answer can be directly observed or reasonably inferred from the image.
   - Questions do not duplicate topics or angles.
   - Wording is precise, unambiguous, and uses natural interrogative phrasing.
   - Questions have sufficient depth, avoiding overly simple yes/no questions.

## Constraints:
1. Every question must be strictly based on image content; no information not present in the image.
2. Cover diverse aspects of the image (objects, scenes, details, relationships, etc.); avoid clustering around a single element.
3. Do not include questions about image metadata (camera, file format, etc.).
4. Avoid redundant phrases like "in the image/photo/picture"; ask questions directly.
5. Produce exactly {{number}} questions with consistent formatting.
6. Avoid simple yes/no questions; encourage open-ended and descriptive questions.
7. Questions must be natural, cannot contain phrases like "in the image/photo/picture/this text/this image".

## Output Format:
- Return a valid JSON array containing only strings.
- Use double quotes for all strings.
- Follow this exact structure:
\`\`\`json
["Question 1", "Question 2", "Question 3"]
\`\`\`

## Output Example:
\`\`\`json
["What is the main content of the scene?", "What is the person in the foreground doing?", "When is this scene most likely taking place?"]
\`\`\`

Please carefully observe the image and generate {{number}} high-quality questions.
`;

export const IMAGE_QUESTION_PROMPT_TR = `
# Rol: Görsel Soru Oluşturma Uzmanı
## Profil:
- Açıklama: Görsel içerik analizi ve soru tasarımında uzman, görüntülerden anahtar bilgileri çıkarabilen ve görme modeli ince ayar veri setleri için yüksek kaliteli sorular üretebilen bir uzmansınız.
- Çıktı Hedefi: Görsel soru-cevap eğitim verileri için uygun {{number}} adet yüksek kaliteli soru oluşturun.

## Yetenekler:
1. Görüntü içeriğini kapsamlı şekilde anlayın ve temel nesneleri, sahneleri, ilişkileri ve detayları tanımlayın.
2. Görüntünün birden fazla yönünü kapsayan net cevap yönelimli sorular tasarlayın.
3. Görsel içeriğin temsili kapsamını sağlamak için zorluk ve çeşitliliği dengeleyin.
4. Çıktının programatik olarak tüketilebilmesi için katı biçimlendirme uygulayın.

## İş Akışı:
1. **Görüntü Analizi**: Görüntüyü dikkatlice gözlemleyin ve ana nesneleri, sahneleri, renkleri, mekansal ilişkileri, eylemleri, duyguları ve diğer öğeleri tanımlayın.
2. **Soru Tasarımı**: Görüntü içeriğinin zenginliğine ve önemine göre en bilgilendirici odak noktalarını seçin, kapsayacak alanlar:
   - İçerik Tanımı (Ne): Görüntüde hangi nesneler ve sahneler var
   - Detay Analizi (Detay): Renkler, şekiller, miktarlar, pozisyonlar gibi belirli özellikler
   - Sahne Anlayışı (Nerede/Ne Zaman): Sahne türü, zaman, konum ve arka plan bilgisi
   - İlişki Akıl Yürütme (İlişki): Nesneler arasındaki ilişkiler, mekansal pozisyonlar
   - Duygusal İfade (Duygu): Görüntünün ilettiği duygular ve atmosfer
   - Derin Anlayış (Neden/Nasıl): Olası nedenler, amaçlar, yöntemler
3. **Kalite Kontrolü**: Her soruyu doğrulayarak şunları sağlayın:
   - Cevap görüntüden doğrudan gözlemlenebilir veya makul şekilde çıkarılabilir.
   - Sorular konuları veya açıları tekrarlamıyor.
   - İfadeler kesin, belirsizlikten uzak ve doğal soru cümlesi kullanıyor.
   - Sorular yeterli derinliğe sahip, aşırı basit evet/hayır sorularından kaçınılıyor.

## Kısıtlamalar:
1. Her soru kesinlikle görüntü içeriğine dayalı olmalı; görüntüde olmayan bilgi eklenmemeli.
2. Görüntünün çeşitli yönlerini kapsayın (nesneler, sahneler, detaylar, ilişkiler, vb.); tek bir öğe etrafında kümelenmekten kaçının.
3. Görüntü meta verileri hakkında sorular eklemeyin (kamera, dosya formatı, vb.).
4. "Görüntüde/fotoğrafta/resimde" gibi gereksiz ifadelerden kaçının; doğrudan soru sorun.
5. Tutarlı biçimlendirmeyle tam olarak {{number}} soru üretin.
6. Basit evet/hayır sorularından kaçının; açık uçlu ve tanımlayıcı soruları teşvik edin.
7. Sorular doğal olmalı, "görüntüde/fotoğrafta/resimde/bu metinde/bu görüntüde" gibi ifadeler içeremez.

## Çıktı Formatı:
- Yalnızca dizeler içeren geçerli bir JSON dizisi döndürün.
- Tüm dizeler için çift tırnak kullanın.
- Bu tam yapıyı izleyin:
\`\`\`json
["Soru 1", "Soru 2", "Soru 3"]
\`\`\`

## Çıktı Örneği:
\`\`\`json
["Sahnenin ana içeriği nedir?", "Ön plandaki kişi ne yapıyor?", "Bu sahne büyük olasılıkla ne zaman gerçekleşiyor?"]
\`\`\`

Lütfen görüntüyü dikkatlice gözlemleyin ve {{number}} adet yüksek kaliteli soru oluşturun.
`;

/**
 * 生成图像问题提示词
 * @param {string} language - 语言，'en' 或 'zh-CN'
 * @param {Object} params - 参数对象
 * @param {number} params.number - 问题数量
 * @param {string} projectId - 项目ID（用于自定义提示词）
 * @returns {string} - 完整的提示词
 */
export async function getImageQuestionPrompt(language, { number = 3 }, projectId = null) {
  const result = await processPrompt(
    language,
    'imageQuestion',
    'IMAGE_QUESTION_PROMPT',
    { zh: IMAGE_QUESTION_PROMPT, en: IMAGE_QUESTION_PROMPT_EN, tr: IMAGE_QUESTION_PROMPT_TR },
    {
      number
    },
    projectId
  );
  return result;
}
