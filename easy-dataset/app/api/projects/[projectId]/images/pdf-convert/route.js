import { NextResponse } from 'next/server';
import { getProjectPath } from '@/lib/db/base';
import { importImagesFromDirectories } from '@/lib/services/images';
import fs from 'fs/promises';
import path from 'path';
import { savePdfAsImages } from '@/lib/util/file';

// PDF 转图片并导入
export async function POST(request, { params }) {
  let tempPdfPath = null;
  let tempImagesDir = null;

  try {
    const { projectId } = params;
    const formData = await request.formData();
    const pdfFile = formData.get('file');

    if (!pdfFile) {
      return NextResponse.json({ error: '请选择 PDF 文件' }, { status: 400 });
    }

    if (!pdfFile.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: '只支持 PDF 文件' }, { status: 400 });
    }

    const projectPath = await getProjectPath(projectId);
    const tempDir = path.join(projectPath, 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    // 1. 保存 PDF 到临时目录
    tempPdfPath = path.join(tempDir, `temp_${Date.now()}_${pdfFile.name}`);
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    await fs.writeFile(tempPdfPath, pdfBuffer);

    // 2. 创建临时图片目录
    tempImagesDir = path.join(tempDir, `pdf_images_${Date.now()}`);
    await fs.mkdir(tempImagesDir, { recursive: true });

    // 3. 调用 pdf2md-js 转换 PDF 为图片
    console.log('开始转换 PDF 为图片...');
    const imagePaths = await savePdfAsImages(tempPdfPath, tempImagesDir, 3);
    console.log('PDF 转换完成，生成图片数量:', imagePaths.length);

    if (!imagePaths || imagePaths.length === 0) {
      throw new Error('PDF 转换失败，未生成图片');
    }

    // 4. 直接调用服务层导入图片
    const importResult = await importImagesFromDirectories(projectId, [tempImagesDir]);

    // 5. 清理临时文件
    try {
      if (tempPdfPath) {
        await fs.unlink(tempPdfPath);
      }
      if (tempImagesDir) {
        const tempImages = await fs.readdir(tempImagesDir);
        for (const img of tempImages) {
          await fs.unlink(path.join(tempImagesDir, img));
        }
        await fs.rmdir(tempImagesDir);
      }
      const tempDirContents = await fs.readdir(tempDir);
      if (tempDirContents.length === 0) {
        await fs.rmdir(tempDir);
      }
    } catch (cleanupErr) {
      console.warn('清理临时文件失败:', cleanupErr);
    }

    return NextResponse.json({
      success: true,
      count: importResult.count,
      images: importResult.images,
      pdfName: pdfFile.name
    });
  } catch (error) {
    console.error('Failed to convert PDF:', error);

    // 清理临时文件
    try {
      if (tempPdfPath) {
        await fs.unlink(tempPdfPath).catch(() => {});
      }
      if (tempImagesDir) {
        const tempImages = await fs.readdir(tempImagesDir).catch(() => []);
        for (const img of tempImages) {
          await fs.unlink(path.join(tempImagesDir, img)).catch(() => {});
        }
        await fs.rmdir(tempImagesDir).catch(() => {});
      }
    } catch (cleanupErr) {
      console.warn('清理临时文件失败:', cleanupErr);
    }

    return NextResponse.json({ error: error.message || 'Failed to convert PDF' }, { status: 500 });
  }
}
