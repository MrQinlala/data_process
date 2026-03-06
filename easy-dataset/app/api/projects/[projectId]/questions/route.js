import { NextResponse } from 'next/server';
import {
  getAllQuestionsByProjectId,
  getQuestions,
  getQuestionsIds,
  saveQuestions,
  updateQuestion
} from '@/lib/db/questions';
import { getImageById, getImageChunk } from '@/lib/db/images';

// 获取项目的所有问题
export async function GET(request, { params }) {
  try {
    const { projectId } = params;
    // 验证项目ID
    if (!projectId) {
      return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }
    const { searchParams } = new URL(request.url);
    let status = searchParams.get('status');
    let answered = undefined;
    if (status === 'answered') answered = true;
    if (status === 'unanswered') answered = false;
    const chunkName = searchParams.get('chunkName');
    const sourceType = searchParams.get('sourceType') || 'all'; // 'all', 'text', 'image'
    const searchMatchMode = searchParams.get('searchMatchMode') || 'match'; // 'match', 'notMatch'
    let selectedAll = searchParams.get('selectedAll');
    if (selectedAll) {
      let data = await getQuestionsIds(
        projectId,
        answered,
        searchParams.get('input'),
        chunkName,
        sourceType,
        searchMatchMode
      );
      return NextResponse.json(data);
    }
    let all = searchParams.get('all');
    if (all) {
      let data = await getAllQuestionsByProjectId(projectId);
      return NextResponse.json(data);
    }
    // 获取问题列表
    const questions = await getQuestions(
      projectId,
      parseInt(searchParams.get('page')),
      parseInt(searchParams.get('size')),
      answered,
      searchParams.get('input'),
      chunkName,
      sourceType,
      searchMatchMode
    );

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Failed to get questions:', String(error));
    return NextResponse.json({ error: error.message || 'Failed to get questions' }, { status: 500 });
  }
}

// 新增问题
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const body = await request.json();
    const { question, chunkId, label } = body;

    // 验证必要参数
    if (!projectId || !question) {
      return NextResponse.json({ error: 'Missing necessary parameters' }, { status: 400 });
    }

    if (!body.chunkId && body.imageId) {
      const chunk = await getImageChunk(projectId);
      body.chunkId = chunk.id;
      body.label = 'image';
    }

    // 添加新问题
    let questions = [body];
    // 保存更新后的数据
    let data = await saveQuestions(projectId, questions);

    // 返回成功响应
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to create question:', String(error));
    return NextResponse.json({ error: error.message || 'Failed to create question' }, { status: 500 });
  }
}

// 更新问题
export async function PUT(request) {
  try {
    const body = await request.json();
    // 保存更新后的数据
    const { imageId } = body;
    if (imageId) {
      body.imageName = (await getImageById(imageId))?.imageName;
    }
    let data = await updateQuestion(body);
    // 返回更新后的问题数据
    return NextResponse.json(data);
  } catch (error) {
    console.error('更新问题失败:', String(error));
    return NextResponse.json({ error: error.message || '更新问题失败' }, { status: 500 });
  }
}
