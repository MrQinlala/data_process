import { NextResponse } from 'next/server';
import { deleteChunkById, getChunkByFileIds, getChunkById, getChunksByFileIds, updateChunkById } from '@/lib/db/chunks';

// 获取文本块内容
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    // 验证参数
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID cannot be empty' }, { status: 400 });
    }
    const { array } = await request.json();
    // 获取文本块内容
    const chunk = await getChunksByFileIds(array);

    return NextResponse.json(chunk);
  } catch (error) {
    console.error('Failed to get text block content:', String(error));
    return NextResponse.json({ error: String(error) || 'Failed to get text block content' }, { status: 500 });
  }
}
