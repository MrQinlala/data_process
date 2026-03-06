import { NextResponse } from 'next/server';
import { getAllDatasetConversations } from '@/lib/db/dataset-conversations';

/**
 * 获取项目中多轮对话数据集的所有标签
 */
export async function GET(request, { params }) {
  try {
    const { projectId } = params;

    if (!projectId) {
      return NextResponse.json({ error: '项目ID不能为空' }, { status: 400 });
    }

    // 获取项目所有对话数据集
    const conversations = await getAllDatasetConversations(projectId);

    // 提取所有标签
    const allTags = new Set();

    conversations.forEach(conversation => {
      if (conversation.tags && typeof conversation.tags === 'string') {
        const tags = conversation.tags.split(/\s+/).filter(tag => tag.trim().length > 0);
        tags.forEach(tag => allTags.add(tag.trim()));
      }
    });

    return NextResponse.json({
      success: true,
      tags: Array.from(allTags).sort()
    });
  } catch (error) {
    console.error('获取对话标签失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message
      },
      { status: 500 }
    );
  }
}
