import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 批量编辑文本块内容
 * POST /api/projects/[projectId]/chunks/batch-edit
 */
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const body = await request.json();
    const { position, content, chunkIds } = body;

    // 验证参数
    if (!position || !content || !chunkIds || !Array.isArray(chunkIds) || chunkIds.length === 0) {
      return NextResponse.json({ error: 'Missing required parameters: position, content, chunkIds' }, { status: 400 });
    }

    if (!['start', 'end'].includes(position)) {
      return NextResponse.json({ error: 'Position must be "start" or "end"' }, { status: 400 });
    }

    // 验证项目权限（获取要编辑的文本块）
    const chunksToUpdate = await prisma.chunks.findMany({
      where: {
        id: { in: chunkIds },
        projectId: projectId
      },
      select: {
        id: true,
        content: true,
        name: true
      }
    });

    if (chunksToUpdate.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (chunksToUpdate.length !== chunkIds.length) {
      return NextResponse.json({ error: 'Some chunks not found' }, { status: 400 });
    }

    // 准备更新数据
    const updates = chunksToUpdate.map(chunk => {
      let newContent;

      if (position === 'start') {
        // 在开头添加内容
        newContent = content + '\n\n' + chunk.content;
      } else {
        // 在结尾添加内容
        newContent = chunk.content + '\n\n' + content;
      }

      return {
        where: { id: chunk.id },
        data: {
          content: newContent,
          size: newContent.length,
          updateAt: new Date()
        }
      };
    });

    async function processBatches(items, batchSize, processFn) {
      const results = [];
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(processFn));
        results.push(...batchResults);
      }
      return results;
    }

    const BATCH_SIZE = 50; // 每批处理 50 个
    await processBatches(updates, BATCH_SIZE, update => prisma.chunks.update(update));

    // 记录操作日志（可选）
    console.log(`Successfully updated ${chunksToUpdate.length} chunks`);

    return NextResponse.json({
      success: true,
      updatedCount: chunksToUpdate.length,
      message: `Successfully updated ${chunksToUpdate.length} chunks`
    });
  } catch (error) {
    console.error('批量编辑文本块失败:', error);

    return NextResponse.json(
      {
        error: 'Batch edit chunks failed',
        details: error.message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
