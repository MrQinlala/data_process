import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const { projectId, datasetId } = params;

    // 1. 获取数据集详情
    const dataset = await db.datasets.findUnique({
      where: { id: datasetId, projectId }
    });

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // 2. 尝试通过 questionId 查找关联的 chunkId
    let chunkId = null;
    if (dataset.questionId) {
      const question = await db.questions.findUnique({
        where: { id: dataset.questionId }
      });
      if (question) {
        chunkId = question.chunkId;
      }
    }

    // 3. 创建评估数据集记录
    // 默认使用 open_ended 类型，因为通常数据集是问答对，适合作为评估
    let evalTags = [];
    try {
      evalTags = JSON.parse(dataset.tags || '[]');
      if (!Array.isArray(evalTags)) evalTags = [];
    } catch (e) {
      evalTags = [];
    }

    // 排除 'Eval' 标签，并将数组转为逗号分隔的字符串
    const evalTagsString = evalTags.filter(tag => tag !== 'Eval').join(',');

    const evalDataset = await db.evalDatasets.create({
      data: {
        projectId,
        question: dataset.question,
        questionType: 'open_ended',
        correctAnswer: dataset.answer,
        tags: evalTagsString,
        note: dataset.note,
        chunkId: chunkId,
        options: '' // 开放题不需要选项
      }
    });

    // 4. 更新原数据集，添加 'Eval' 标签
    let currentTags = [];
    try {
      currentTags = JSON.parse(dataset.tags || '[]');
    } catch (e) {
      // ignore error
    }

    if (!currentTags.includes('Eval')) {
      currentTags.push('Eval');
      await db.datasets.update({
        where: { id: datasetId },
        data: {
          tags: JSON.stringify(currentTags)
        }
      });
    }

    return NextResponse.json({ success: true, evalDataset });
  } catch (error) {
    console.error('Failed to copy dataset to eval:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
