import { NextResponse } from 'next/server';
import { getProjectPath } from '@/lib/db/base';
import { importImagesFromDirectories } from '@/lib/services/images';
import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';

// 压缩包解压并导入图片
export async function POST(request, { params }) {
  let tempZipPath = null;
  let tempExtractDir = null;

  try {
    const { projectId } = params;
    const formData = await request.formData();
    const zipFile = formData.get('file');

    if (!zipFile) {
      return NextResponse.json({ error: '请选择压缩包文件' }, { status: 400 });
    }

    if (!zipFile.name.toLowerCase().endsWith('.zip')) {
      return NextResponse.json({ error: '只支持 ZIP 格式的压缩包' }, { status: 400 });
    }

    const projectPath = await getProjectPath(projectId);
    const tempDir = path.join(projectPath, 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    // 1. 保存压缩包到临时目录
    tempZipPath = path.join(tempDir, `temp_${Date.now()}_${zipFile.name}`);
    const zipBuffer = Buffer.from(await zipFile.arrayBuffer());
    await fs.writeFile(tempZipPath, zipBuffer);

    // 2. 创建临时解压目录
    tempExtractDir = path.join(tempDir, `zip_extract_${Date.now()}`);
    await fs.mkdir(tempExtractDir, { recursive: true });

    // 3. 使用 adm-zip 解压文件
    console.log('开始解压压缩包...');
    const zip = new AdmZip(tempZipPath);
    const zipEntries = zip.getEntries();

    // 支持的图片扩展名
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    let extractedCount = 0;

    // 遍历压缩包中的所有文件
    for (const entry of zipEntries) {
      // 跳过目录和隐藏文件
      if (
        entry.isDirectory ||
        entry.entryName.startsWith('__MACOSX') ||
        path.basename(entry.entryName).startsWith('.')
      ) {
        continue;
      }

      const ext = path.extname(entry.entryName).toLowerCase();
      if (imageExtensions.includes(ext)) {
        // 提取文件名（不包含路径）
        const fileName = path.basename(entry.entryName);
        const targetPath = path.join(tempExtractDir, fileName);

        // 解压文件
        zip.extractEntryTo(entry, tempExtractDir, false, true, false, fileName);
        extractedCount++;
      }
    }

    console.log(`压缩包解压完成，提取图片数量: ${extractedCount}`);

    if (extractedCount === 0) {
      throw new Error('压缩包中没有找到支持的图片文件');
    }

    // 4. 调用服务层导入图片
    const importResult = await importImagesFromDirectories(projectId, [tempExtractDir]);

    // 5. 清理临时文件
    try {
      if (tempZipPath) {
        await fs.unlink(tempZipPath);
      }
      if (tempExtractDir) {
        const tempImages = await fs.readdir(tempExtractDir);
        for (const img of tempImages) {
          await fs.unlink(path.join(tempExtractDir, img));
        }
        await fs.rmdir(tempExtractDir);
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
      zipName: zipFile.name
    });
  } catch (error) {
    console.error('Failed to import ZIP:', error);

    // 清理临时文件
    try {
      if (tempZipPath) {
        await fs.unlink(tempZipPath).catch(() => {});
      }
      if (tempExtractDir) {
        const tempImages = await fs.readdir(tempExtractDir).catch(() => []);
        for (const img of tempImages) {
          await fs.unlink(path.join(tempExtractDir, img)).catch(() => {});
        }
        await fs.rmdir(tempExtractDir).catch(() => {});
      }
    } catch (cleanupErr) {
      console.warn('清理临时文件失败:', cleanupErr);
    }

    return NextResponse.json({ error: error.message || 'Failed to import ZIP' }, { status: 500 });
  }
}
