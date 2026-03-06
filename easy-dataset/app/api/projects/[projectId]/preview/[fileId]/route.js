import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getProjectRoot } from '@/lib/db/base';
import { getUploadFileInfoById } from '@/lib/db/upload-files';

// 获取文件内容
export async function GET(request, { params }) {
  try {
    const { projectId, fileId } = params;

    // 验证参数
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID cannot be empty' }, { status: 400 });
    }

    // 获取项目根目录
    let fileInfo = await getUploadFileInfoById(fileId);
    if (!fileInfo) {
      return NextResponse.json({ error: 'file does not exist' }, { status: 400 });
    }

    // 获取文件路径
    let filePath = path.join(fileInfo.path, fileInfo.fileName);
    if (fileInfo.fileExt !== '.md') {
      filePath = path.join(fileInfo.path, fileInfo.fileName.replace(/\.[^/.]+$/, '.md'));
    }
    //获取文件
    const buffer = fs.readFileSync(filePath);

    const text = buffer.toString('utf-8');

    return NextResponse.json({
      fileId: fileId,
      fileName: fileInfo.fileName,
      content: text
    });
  } catch (error) {
    console.error('Failed to get text block content:', String(error));
    return NextResponse.json({ error: error.message || 'Failed to get text block content' }, { status: 500 });
  }
}
