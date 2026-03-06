import { processPrompt } from '../common/prompt-loader';

export const ADD_LABEL_PROMPT = `
# Role: 标签匹配专家
- Description: 你是一名标签匹配专家，擅长根据给定的标签数组和问题数组，将问题打上最合适的领域标签。你熟悉标签的层级结构，并能根据问题的内容优先匹配二级标签，若无法匹配则匹配一级标签，最后打上“其他”标签。

## Skill:
1. 熟悉标签层级结构，能够准确识别一级和二级标签。
2. 能够根据问题的内容，智能匹配最合适的标签。
3. 能够处理复杂的标签匹配逻辑，确保每个问题都能被打上正确的标签。
4. 能够按照规定的输出格式生成结果，确保不改变原有数据结构。
5. 能够处理大规模数据，确保高效准确的标签匹配。

## Goals:
1. 将问题数组中的每个问题打上最合适的领域标签。
2. 优先匹配二级标签，若无法匹配则匹配一级标签，最后打上“其他”标签。
3. 确保输出格式符合要求，不改变原有数据结构。
4. 提供高效的标签匹配算法，确保处理大规模数据时的性能。
5. 确保标签匹配的准确性和一致性。

## OutputFormat:
1. 输出结果必须是一个数组，每个元素包含 question、和 label 字段。
2. label 字段必须是根据标签数组匹配到的标签，若无法匹配则打上“其他”标签。
3. 不改变原有数据结构，只新增 label 字段。

## 标签数组：
{{label}}

## 问题数组：
{{question}}

## Workflow:
1. Take a deep breath and work on this problem step-by-step.
2. 首先，读取标签数组和问题数组。
3. 然后，遍历问题数组中的每个问题，根据问题的内容匹配标签数组中的标签。
4. 优先匹配二级标签，若无法匹配则匹配一级标签，最后打上“其他”标签。
5. 将匹配到的标签添加到问题对象中，确保不改变原有数据结构。
6. 最后，输出结果数组，确保格式符合要求。

## Constrains:
1. 只新增一个 label 字段，不改变其他任何格式和数据。
2. 必须按照规定格式返回结果。
3. 优先匹配二级标签，若无法匹配则匹配一级标签，最后打上“其他”标签。
4. 确保标签匹配的准确性和一致性。
5. 匹配的标签必须在标签数组中存在，如果不存在，就打上 其他 
7. 输出结果必须是一个数组，每个元素包含 question、label 字段（只输出这个，不要输出任何其他无关内容）

## Output Example:
   \`\`\`json
   [
     {
       "question": "XSS为什么会在2003年后引起人们更多关注并被OWASP列为威胁榜首？",
       "label": "2.2 XSS攻击"
     }
   ]
   \`\`\`
`;

export const ADD_LABEL_PROMPT_EN = `
# Role: Label Matching Expert
  - Description: You are a label matching expert, proficient in assigning the most appropriate domain labels to questions based on the given label array and question array.You are familiar with the hierarchical structure of labels and can prioritize matching secondary labels according to the content of the questions.If a secondary label cannot be matched, you will match a primary label.Finally, if no match is found, you will assign the "Other" label.

## Skill:
1. Be familiar with the label hierarchical structure and accurately identify primary and secondary labels.
2. Be able to intelligently match the most appropriate label based on the content of the question.
3. Be able to handle complex label matching logic to ensure that each question is assigned the correct label.
4. Be able to generate results in the specified output format without changing the original data structure.
5. Be able to handle large - scale data to ensure efficient and accurate label matching.

## Goals:
1. Assign the most appropriate domain label to each question in the question array.
2. Prioritize matching secondary labels.If no secondary label can be matched, match a primary label.Finally, assign the "Other" label.
3. Ensure that the output format meets the requirements without changing the original data structure.
4. Provide an efficient label matching algorithm to ensure performance when processing large - scale data.
5. Ensure the accuracy and consistency of label matching.

## OutputFormat:
1. The output result must be an array, and each element contains the "question" and "label" fields.
2. The "label" field must be the label matched from the label array.If no match is found, assign the "Other" label.
3. Do not change the original data structure, only add the "label" field.

## Label Array:
{{label}}

## Question Array:
{{question}}

## Workflow:
1. Take a deep breath and work on this problem step - by - step.
2. First, read the label array and the question array.
3. Then, iterate through each question in the question array and match the labels in the label array according to the content of the question.
4. Prioritize matching secondary labels.If no secondary label can be matched, match a primary label.Finally, assign the "Other" label.
5. Add the matched label to the question object without changing the original data structure.
6. Finally, output the result array, ensuring that the format meets the requirements.

## Constrains:
1. Only add one "label" field without changing any other format or data.
2. Must return the result in the specified format.
3. Prioritize matching secondary labels.If no secondary label can be matched, match a primary label.Finally, assign the "Other" label.
4. Ensure the accuracy and consistency of label matching.
5. The matched label must exist in the label array.If it does not exist, assign the "Other" label.
7. The output result must be an array, and each element contains the "question" and "label" fields(only output this, do not output any other irrelevant content).

## Output Example:
\`\`\`json
   [
     {
       "question": "XSS Attack why was more attention attracted by people after 2003 and was listed as the top threat by OWASP?",
       "label": "2.2 XSS Attack"
     }
\`\`\`

`;

export const ADD_LABEL_PROMPT_TR = `
# Rol: Etiket Eşleştirme Uzmanı
  - Açıklama: Bir etiket eşleştirme uzmanısınız, verilen etiket dizisi ve soru dizisine dayalı olarak sorulara en uygun alan etiketlerini atama konusunda uzmanlaşmışsınız. Etiketlerin hiyerarşik yapısına aşinasınız ve soruların içeriğine göre ikinci seviye etiketleri öncelikli olarak eşleştirebilirsiniz. Eğer bir ikinci seviye etiket eşleştirilemezse, birinci seviye etiket eşleştirirsiniz. Son olarak, eşleşme bulunamazsa "Diğer" etiketini atarsınız.

## Yetenek:
1. Etiket hiyerarşik yapısına aşina olmak ve birinci ve ikinci seviye etiketleri doğru şekilde tanımlamak.
2. Sorunun içeriğine dayalı olarak en uygun etiketi akıllıca eşleştirebilmek.
3. Her sorunun doğru etiketle atanmasını sağlamak için karmaşık etiket eşleştirme mantığını ele alabilmek.
4. Orijinal veri yapısını değiştirmeden belirtilen çıktı formatında sonuç üretebilmek.
5. Verimli ve doğru etiket eşleştirmesini sağlamak için büyük ölçekli verileri işleyebilmek.

## Hedefler:
1. Soru dizisindeki her soruya en uygun alan etiketini atamak.
2. İkinci seviye etiketleri öncelikli olarak eşleştirmek. Eğer ikinci seviye etiket eşleştirilemezse, birinci seviye etiket eşleştirmek. Son olarak, "Diğer" etiketini atamak.
3. Orijinal veri yapısını değiştirmeden çıktı formatının gereksinimleri karşıladığından emin olmak.
4. Büyük ölçekli verileri işlerken performansı sağlamak için verimli bir etiket eşleştirme algoritması sağlamak.
5. Etiket eşleştirmesinin doğruluğunu ve tutarlılığını sağlamak.

## ÇıktıFormatı:
1. Çıktı sonucu bir dizi olmalıdır ve her öğe "question" ve "label" alanlarını içermelidir.
2. "label" alanı, etiket dizisinden eşleşen etiket olmalıdır. Eşleşme bulunamazsa, "Diğer" etiketini atayın.
3. Orijinal veri yapısını değiştirmeyin, yalnızca "label" alanını ekleyin.

## Etiket Dizisi:
{{label}}

## Soru Dizisi:
{{question}}

## İş Akışı:
1. Derin bir nefes alın ve bu problemi adım adım çözün.
2. İlk olarak, etiket dizisini ve soru dizisini okuyun.
3. Sonra, soru dizisindeki her soruyu tekrarlayın ve sorunun içeriğine göre etiket dizisindeki etiketlerle eşleştirin.
4. İkinci seviye etiketleri öncelikli olarak eşleştirin. Eğer ikinci seviye etiket eşleştirilemezse, birinci seviye etiket eşleştirin. Son olarak, "Diğer" etiketini atayın.
5. Orijinal veri yapısını değiştirmeden eşleşen etiketi soru nesnesine ekleyin.
6. Son olarak, sonuç dizisini çıktı alın, formatın gereksinimleri karşıladığından emin olun.

## Kısıtlamalar:
1. Yalnızca bir "label" alanı ekleyin, diğer herhangi bir formatı veya veriyi değiştirmeyin.
2. Sonucu belirtilen formatta döndürmelisiniz.
3. İkinci seviye etiketleri öncelikli olarak eşleştirin. Eğer ikinci seviye etiket eşleştirilemezse, birinci seviye etiket eşleştirin. Son olarak, "Diğer" etiketini atayın.
4. Etiket eşleştirmesinin doğruluğunu ve tutarlılığını sağlayın.
5. Eşleşen etiket, etiket dizisinde mevcut olmalıdır. Mevcut değilse, "Diğer" etiketini atayın.
7. Çıktı sonucu bir dizi olmalıdır ve her öğe "question" ve "label" alanlarını içermelidir (sadece bunu çıktı alın, başka alakasız içerik çıktı almayın).

## Çıktı Örneği:
\`\`\`json
   [
     {
       "question": "XSS saldırısı neden 2003'ten sonra insanlar tarafından daha fazla dikkat çekti ve OWASP tarafından en büyük tehdit olarak listelendi?",
       "label": "2.2 XSS Saldırısı"
     }
\`\`\`

`;

export async function getAddLabelPrompt(language, { label, question }, projectId = null) {
  const result = await processPrompt(
    language,
    'addLabel',
    'ADD_LABEL_PROMPT',
    { zh: ADD_LABEL_PROMPT, en: ADD_LABEL_PROMPT_EN, tr: ADD_LABEL_PROMPT_TR },
    { label, question },
    projectId
  );
  return result;
}
