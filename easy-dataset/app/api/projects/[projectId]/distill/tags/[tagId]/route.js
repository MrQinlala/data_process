import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 更新标签接口
 */
export async function PUT(request, { params }) {
  try {
    const { projectId, tagId } = params;

    // 验证参数
    if (!projectId || !tagId) {
      return NextResponse.json({ error: '项目ID和标签ID不能为空' }, { status: 400 });
    }

    const { label } = await request.json();

    if (!label || !label.trim()) {
      return NextResponse.json({ error: '标签名称不能为空' }, { status: 400 });
    }

    // 检查标签是否存在
    const existingTag = await db.tags.findUnique({
      where: { id: tagId }
    });

    if (!existingTag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 });
    }

    // 检查项目ID是否匹配
    if (existingTag.projectId !== projectId) {
      return NextResponse.json({ error: '无权限编辑此标签' }, { status: 403 });
    }

    // 检查新标签名称是否已存在（同级标签）
    const duplicateTag = await db.tags.findFirst({
      where: {
        projectId,
        label: label.trim(),
        parentId: existingTag.parentId,
        id: { not: tagId }
      }
    });

    if (duplicateTag) {
      return NextResponse.json({ error: '同级标签名称已存在' }, { status: 400 });
    }

    // 更新标签
    const updatedTag = await db.tags.update({
      where: { id: tagId },
      data: { label: label.trim() }
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('[标签编辑] 更新标签失败:', String(error));
    return NextResponse.json({ error: error.message || '更新标签失败' }, { status: 500 });
  }
}
