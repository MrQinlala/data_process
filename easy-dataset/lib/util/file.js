import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { PDFiumLibrary } from '@hyzyla/pdfium';
import fs from 'fs-extra';
import sharp from 'sharp';

export async function getFileMD5(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('md5');
    const stream = createReadStream(filePath);

    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

export function filterDomainTree(tree = []) {
  for (let i = 0; i < tree.length; i++) {
    const { child } = tree[i];
    delete tree[i].id;
    delete tree[i].projectId;
    delete tree[i].parentId;
    delete tree[i].questionCount;
    filterDomainTree(child);
  }
  return tree;
}

async function renderFunction(options) {
  return await sharp(options.data, {
    raw: {
      width: options.width,
      height: options.height,
      channels: 4
    }
  })
    .png()
    .toBuffer();
}

export const savePdfAsImages = async (pdfData, outputDir, scale = 3) => {
  // 确保输出目录存在
  await fs.ensureDir(outputDir);

  // 获取PDF文件名（不含扩展名）作为前缀
  let fileNamePrefix = 'document';
  if (typeof pdfData === 'string') {
    const path = require('path');
    fileNamePrefix = path.basename(pdfData, path.extname(pdfData));
  }

  // 如果pdfData是字符串，则当作路径处理
  let data;
  if (typeof pdfData === 'string') {
    data = new Uint8Array(await fs.readFile(pdfData));
  } else {
    data = new Uint8Array(pdfData);
  }

  // 加载PDF文档
  const library = await PDFiumLibrary.init();
  const document = await library.loadDocument(data);
  const numPages = document.getPageCount();

  console.log(`PDF文档共 ${numPages} 页，开始生成截图...`);

  // 存储生成的图像文件路径
  const imagePaths = [];

  // 处理每一页
  for (const page of document.pages()) {
    const pageIndex = page.number + 1;
    console.log(`生成第 ${pageIndex} 页截图...`);

    // 将PDF页面渲染为PNG图片
    const image = await page.render({
      scale: scale,
      render: renderFunction
    });

    // 生成文件名和路径，使用PDF文件名作为前缀
    const fileName = `${fileNamePrefix}-${pageIndex.toString().padStart(4, '0')}.png`;
    const filePath = `${outputDir}/${fileName}`;

    // 保存图片到文件
    await fs.writeFile(filePath, Buffer.from(image.data));
    imagePaths.push(filePath);
  }

  document.destroy();
  library.destroy();

  console.log(`PDF截图完成，共生成 ${imagePaths.length} 张图片`);
  return imagePaths;
};
