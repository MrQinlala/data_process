import { getChunkContentsByNames } from '@/lib/db/chunks';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const { chunkNames } = await request.json();

    if (!chunkNames || !Array.isArray(chunkNames)) {
      return NextResponse.json({ error: 'chunkNames 参数必须是数组' }, { status: 400 });
    }

    const chunkContentMap = await getChunkContentsByNames(projectId, chunkNames);

    return NextResponse.json(chunkContentMap);
  } catch (error) {
    console.error('批量获取文本块内容失败:', error);
    return NextResponse.json({ error: '批量获取文本块内容失败' }, { status: 500 });
  }
}
