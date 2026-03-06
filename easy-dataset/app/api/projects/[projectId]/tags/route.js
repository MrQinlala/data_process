import { NextResponse } from 'next/server';
import { getTags, createTag, updateTag, deleteTag } from '@/lib/db/tags';
import { getQuestionsByTagName } from '@/lib/db/questions';

// 获取项目的标签树
export async function GET(request, { params }) {
  try {
    const { projectId } = params;

    // 验证项目ID
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 获取标签树
    const tags = await getTags(projectId);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Failed to obtain the label tree:', String(error));
    return NextResponse.json({ error: error.message || 'Failed to obtain the label tree' }, { status: 500 });
  }
}

// 更新项目的标签树
export async function PUT(request, { params }) {
  try {
    const { projectId } = params;

    // 验证项目ID
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 获取请求体
    const { tags } = await request.json();
    if (tags.id === undefined || tags.id === null || tags.id === '') {
      console.log('createTag', tags);
      let res = await createTag(projectId, tags.label, tags.parentId);
      return NextResponse.json({ tags: res });
    } else {
      let res = await updateTag(tags.label, tags.id);
      return NextResponse.json({ tags: res });
    }
  } catch (error) {
    console.error('Failed to update tags:', String(error));
    return NextResponse.json({ error: error.message || 'Failed to update tags' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { projectId } = params;

    // 验证项目ID
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    const { tagName } = await request.json();
    console.log('tagName', tagName);
    let data = await getQuestionsByTagName(projectId, tagName);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to obtain the label tree:', String(error));
    return NextResponse.json({ error: error.message || 'Failed to obtain the label tree' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { projectId } = params;

    // 验证项目ID
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 获取要删除的标签ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '标签 ID 是必需的' }, { status: 400 });
    }

    console.log(`正在删除标签: ${id}`);
    const result = await deleteTag(id);
    console.log(`删除标签成功: ${id}`);

    return NextResponse.json({ success: true, message: '删除标签成功', data: result });
  } catch (error) {
    console.error('删除标签失败:', String(error));
    return NextResponse.json(
      {
        error: error.message || '删除标签失败',
        success: false
      },
      { status: 500 }
    );
  }
}
