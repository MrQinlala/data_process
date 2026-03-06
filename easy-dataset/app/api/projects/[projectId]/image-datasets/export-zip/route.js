import { NextResponse } from 'next/server';
import { getImageDatasetsForExport } from '@/lib/db/imageDatasets';
import archiver from 'archiver';
import { getProjectPath } from '@/lib/db/base';
import path from 'path';
import fs from 'fs';

/**
 * 导出图片文件压缩包
 */
export async function GET(request, { params }) {
  try {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);
    const confirmedOnly = searchParams.get('confirmedOnly') === 'true';

    // 验证项目ID
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID cannot be empty' }, { status: 400 });
    }

    // 获取数据集（用于确定需要哪些图片）
    const datasets = await getImageDatasetsForExport(projectId, confirmedOnly);

    if (!datasets || datasets.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 404 });
    }

    // 获取所有需要的图片名称
    const imageNames = new Set(datasets.map(d => d.imageName).filter(Boolean));

    if (imageNames.size === 0) {
      return NextResponse.json({ error: 'No images to export' }, { status: 404 });
    }

    // 创建压缩包
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // 设置响应头
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `images-${projectId}-${dateStr}.zip`;

    // 添加图片文件到压缩包
    const projectPath = await getProjectPath(projectId);
    const imageDir = path.join(projectPath, 'images');

    if (!fs.existsSync(imageDir)) {
      return NextResponse.json({ error: 'Image directory not found' }, { status: 404 });
    }

    let addedCount = 0;
    for (const imageName of imageNames) {
      const imagePath = path.join(imageDir, imageName);
      if (fs.existsSync(imagePath)) {
        archive.file(imagePath, { name: imageName });
        addedCount++;
      }
    }

    if (addedCount === 0) {
      return NextResponse.json({ error: 'No image files found' }, { status: 404 });
    }

    // 完成压缩
    archive.finalize();

    // 返回流式响应
    return new NextResponse(archive, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Failed to export images:', String(error));
    return NextResponse.json(
      {
        error: error.message || 'Failed to export images'
      },
      { status: 500 }
    );
  }
}
