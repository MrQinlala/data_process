import { NextResponse } from 'next/server';
import { saveChunks, deleteChunksByFileId } from '@/lib/db/chunks';
import path from 'path';
import fs from 'fs/promises';
import { getProjectRoot } from '@/lib/db/base';

/**
 * 处理自定义分块请求
 * @param {Request} request - 请求对象
 * @param {Object} params - 路由参数
 * @returns {Promise<Response>} - 响应对象
 */
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const { fileId, fileName, content, splitPoints } = await request.json();

    // 参数验证
    if (!projectId || !fileId || !fileName || !content || !splitPoints) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 获取项目根目录
    const projectRoot = await getProjectRoot();
    const projectPath = path.join(projectRoot, projectId);

    // 检查项目是否存在
    try {
      await fs.access(projectPath);
    } catch (error) {
      return NextResponse.json({ error: 'Project does not exist' }, { status: 404 });
    }

    // 先删除该文件已有的文本块
    await deleteChunksByFileId(projectId, fileId);

    // 根据分块点将文件内容分割成多个块
    const customChunks = generateCustomChunks(projectId, fileId, fileName, content, splitPoints);

    // 保存新的文本块
    await saveChunks(customChunks);

    return NextResponse.json({
      success: true,
      message: 'Custom chunks saved successfully',
      totalChunks: customChunks.length
    });
  } catch (error) {
    console.error('自定义分块处理出错:', String(error));
    return NextResponse.json({ error: error.message || 'Failed to process custom split request' }, { status: 500 });
  }
}

/**
 * 根据分块点生成自定义文本块
 * @param {string} projectId - 项目ID
 * @param {string} fileId - 文件ID
 * @param {string} fileName - 文件名
 * @param {string} content - 文件内容
 * @param {Array} splitPoints - 分块点数组
 * @returns {Array} - 生成的文本块数组
 */
function generateCustomChunks(projectId, fileId, fileName, content, splitPoints) {
  // 按位置排序分块点
  const sortedPoints = [...splitPoints].sort((a, b) => a.position - b.position);

  // 创建分块
  const chunks = [];
  let startPos = 0;

  // 处理每个分块点
  for (let i = 0; i < sortedPoints.length; i++) {
    const endPos = sortedPoints[i].position;

    // 提取当前分块内容
    const chunkContent = content.substring(startPos, endPos);

    // 跳过空白分块
    if (chunkContent.trim().length === 0) {
      startPos = endPos;
      continue;
    }

    // 创建分块对象
    const chunk = {
      projectId,
      name: `${path.basename(fileName, path.extname(fileName))}-part-${i + 1}`,
      fileId,
      fileName,
      content: chunkContent,
      summary: `${fileName} 自定义分块 ${i + 1}/${sortedPoints.length + 1}`,
      size: chunkContent.length
    };

    chunks.push(chunk);
    startPos = endPos;
  }

  // 添加最后一个分块（如果有内容）
  const lastChunkContent = content.substring(startPos);
  if (lastChunkContent.trim().length > 0) {
    const lastChunk = {
      projectId,
      name: `${path.basename(fileName, path.extname(fileName))}-part-${sortedPoints.length + 1}`,
      fileId,
      fileName,
      content: lastChunkContent,
      summary: `${fileName} 自定义分块 ${sortedPoints.length + 1}/${sortedPoints.length + 1}`,
      size: lastChunkContent.length
    };

    chunks.push(lastChunk);
  }

  return chunks;
}
