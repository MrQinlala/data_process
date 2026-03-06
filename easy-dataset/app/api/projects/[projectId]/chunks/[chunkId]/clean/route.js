import { NextResponse } from 'next/server';
import logger from '@/lib/util/logger';
import cleanService from '@/lib/services/clean';

// 为指定文本块进行数据清洗
export async function POST(request, { params }) {
  try {
    const { projectId, chunkId } = params;

    // 验证项目ID和文本块ID
    if (!projectId || !chunkId) {
      return NextResponse.json({ error: 'Project ID or text block ID cannot be empty' }, { status: 400 });
    }

    // 获取请求体
    const { model, language = '中文' } = await request.json();

    if (!model) {
      return NextResponse.json({ error: 'Model cannot be empty' }, { status: 400 });
    }

    // 使用数据清洗服务
    const result = await cleanService.cleanDataForChunk(projectId, chunkId, {
      model,
      language
    });

    // 返回清洗结果
    return NextResponse.json({
      chunkId,
      originalLength: result.originalLength,
      cleanedLength: result.cleanedLength,
      success: result.success,
      message: '数据清洗完成'
    });
  } catch (error) {
    logger.error('Error cleaning data:', error);
    return NextResponse.json({ error: error.message || 'Error cleaning data' }, { status: 500 });
  }
}
