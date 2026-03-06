import JSZip from 'jszip';
import { DOMParser } from 'xmldom';
import TurndownService from 'turndown';

/**
 * 处理 EPUB 文件，提取文本内容并转换为 Markdown
 * @param {ArrayBuffer} arrayBuffer - EPUB 文件的二进制数据
 * @returns {Promise<string>} - 转换后的 Markdown 内容
 */
export async function processEpub(arrayBuffer) {
  try {
    const zip = new JSZip();
    const epub = await zip.loadAsync(arrayBuffer);

    // 1. 读取 META-INF/container.xml 获取 OPF 文件路径
    const containerXml = await epub.file('META-INF/container.xml').async('text');
    const containerDoc = new DOMParser().parseFromString(containerXml, 'text/xml');
    const opfPath = containerDoc.getElementsByTagName('rootfile')[0].getAttribute('full-path');

    // 2. 读取 OPF 文件获取章节信息
    const opfContent = await epub.file(opfPath).async('text');
    const opfDoc = new DOMParser().parseFromString(opfContent, 'text/xml');

    // 获取 manifest 中的所有项目
    const manifestItems = Array.from(opfDoc.getElementsByTagName('item'));
    const spineItems = Array.from(opfDoc.getElementsByTagName('itemref'));

    // 3. 按照 spine 顺序获取章节文件
    const chapters = [];
    for (const spineItem of spineItems) {
      const idref = spineItem.getAttribute('idref');
      const manifestItem = manifestItems.find(item => item.getAttribute('id') === idref);

      if (manifestItem && manifestItem.getAttribute('media-type') === 'application/xhtml+xml') {
        const href = manifestItem.getAttribute('href');
        const chapterPath = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) + href : href;

        try {
          const chapterContent = await epub.file(chapterPath).async('text');
          chapters.push({
            title: getChapterTitle(chapterContent),
            content: chapterContent,
            path: chapterPath
          });
        } catch (error) {
          console.warn(`无法读取章节文件: ${chapterPath}`, error);
        }
      }
    }

    // 4. 转换为 Markdown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });

    // 配置 turndown 规则
    turndownService.addRule('removeStyles', {
      filter: ['style', 'script'],
      replacement: () => ''
    });

    let markdownContent = '';

    // 添加书籍标题
    const title = getBookTitle(opfDoc);
    if (title) {
      markdownContent += `# ${title}\n\n`;
    }

    // 转换每个章节
    for (const chapter of chapters) {
      if (chapter.title && chapter.title !== title) {
        markdownContent += `## ${chapter.title}\n\n`;
      }

      // 提取正文内容
      const bodyContent = extractBodyContent(chapter.content);
      const chapterMarkdown = turndownService.turndown(bodyContent);

      // 清理多余的空行
      const cleanedMarkdown = chapterMarkdown.replace(/\n{3,}/g, '\n\n').trim();

      if (cleanedMarkdown) {
        markdownContent += cleanedMarkdown + '\n\n';
      }
    }

    return markdownContent.trim();
  } catch (error) {
    console.error('处理 EPUB 文件时出错:', error);
    throw new Error(`EPUB 文件处理失败: ${error.message}`);
  }
}

/**
 * 从 OPF 文件中获取书籍标题
 */
function getBookTitle(opfDoc) {
  try {
    const titleElements = opfDoc.getElementsByTagName('dc:title');
    if (titleElements.length > 0) {
      return titleElements[0].textContent.trim();
    }

    const titleElements2 = opfDoc.getElementsByTagName('title');
    if (titleElements2.length > 0) {
      return titleElements2[0].textContent.trim();
    }
  } catch (error) {
    console.warn('获取书籍标题失败:', error);
  }
  return null;
}

/**
 * 从章节内容中提取标题
 */
function getChapterTitle(htmlContent) {
  try {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');

    // 尝试从 title 标签获取
    const titleElement = doc.getElementsByTagName('title')[0];
    if (titleElement && titleElement.textContent.trim()) {
      return titleElement.textContent.trim();
    }

    // 尝试从第一个 h1-h6 标签获取
    for (let i = 1; i <= 6; i++) {
      const headings = doc.getElementsByTagName(`h${i}`);
      if (headings.length > 0 && headings[0].textContent.trim()) {
        return headings[0].textContent.trim();
      }
    }

    // 尝试从第一个段落获取（如果很短的话）
    const paragraphs = doc.getElementsByTagName('p');
    if (paragraphs.length > 0) {
      const firstParagraph = paragraphs[0].textContent.trim();
      if (firstParagraph.length < 100) {
        return firstParagraph;
      }
    }
  } catch (error) {
    console.warn('提取章节标题失败:', error);
  }
  return null;
}

/**
 * 从 HTML 内容中提取 body 部分
 */
function extractBodyContent(htmlContent) {
  try {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const bodyElement = doc.getElementsByTagName('body')[0];

    if (bodyElement) {
      // 移除不需要的元素
      const elementsToRemove = ['script', 'style', 'nav', 'header', 'footer'];
      elementsToRemove.forEach(tagName => {
        const elements = bodyElement.getElementsByTagName(tagName);
        for (let i = elements.length - 1; i >= 0; i--) {
          elements[i].parentNode.removeChild(elements[i]);
        }
      });

      return bodyElement.innerHTML || bodyElement.textContent;
    }

    // 如果没有 body 标签，返回整个内容
    return htmlContent;
  } catch (error) {
    console.warn('提取正文内容失败:', error);
    return htmlContent;
  }
}
