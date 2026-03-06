import { NextResponse } from 'next/server';
import { generateEvalQuestionsForChunk } from '@/lib/services/eval';
import logger from '@/lib/util/logger';

/**
 * 为指定文本块生成测评题目
 */
export async function POST(request, { params }) {
  try {
    const { projectId, chunkId } = params;

    // 验证参数
    if (!projectId || !chunkId) {
      return NextResponse.json({ error: 'Project ID and Chunk ID are required' }, { status: 400 });
    }

    // 获取请求体
    const { model, language = 'zh-CN' } = await request.json();

    if (!model) {
      return NextResponse.json({ error: 'Model configuration is required' }, { status: 400 });
    }

    // 调用服务层生成测评题目
    const result = await generateEvalQuestionsForChunk(projectId, chunkId, {
      model,
      language
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error generating eval questions:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate eval questions' }, { status: 500 });
  }
}
