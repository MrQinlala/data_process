import TurndownService from 'turndown';
import mammoth from 'mammoth';
import { processEpub } from './epub';

/**
 * 获取文件内容
 * @param {*} file
 */
export async function getContent(file) {
  let fileContent;
  let fileName = file.name;

  // 如果是 docx 文件，先转换为 markdown
  if (file.name.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const htmlResult = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        convertImage: image => {
          return mammoth.docx.paragraph({
            children: [
              mammoth.docx.textRun({
                text: ''
              })
            ]
          });
        }
      }
    );
    const turndownService = new TurndownService();
    fileContent = turndownService.turndown(htmlResult.value);
    fileName = file.name.replace('.docx', '.md');
  } else if (file.name.endsWith('.epub')) {
    // 如果是 epub 文件，转换为 markdown
    const arrayBuffer = await file.arrayBuffer();
    fileContent = await processEpub(arrayBuffer);
    fileName = file.name.replace('.epub', '.md');
  } else {
    // 对于 md 和 txt 文件，直接读取内容
    const reader = new FileReader();
    fileContent = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
    fileName = file.name.replace('.txt', '.md');
  }
  return { fileContent, fileName };
}
