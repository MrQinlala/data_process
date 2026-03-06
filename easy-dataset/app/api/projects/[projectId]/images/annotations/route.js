import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getImageById, getImageChunk } from '@/lib/db/images';
import { createImageDataset } from '@/lib/db/imageDatasets';

const prisma = new PrismaClient();

// 创建标注
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const { imageId, questionId, question, answerType, answer, note } = await request.json();

    // 验证必填字段
    if (!imageId || !question || !answerType || answer === undefined || answer === null) {
      return NextResponse.json({ error: '缺少必要参数：imageId, question, answerType, answer' }, { status: 400 });
    }

    // 验证图片存在
    const image = await getImageById(imageId);
    if (!image || image.projectId !== projectId) {
      return NextResponse.json({ error: '图片不存在' }, { status: 404 });
    }

    // 验证答案类型
    if (!['text', 'label', 'custom_format'].includes(answerType)) {
      return NextResponse.json({ error: '无效的答案类型' }, { status: 400 });
    }

    // 验证答案内容
    if (answerType === 'text' && typeof answer !== 'string') {
      return NextResponse.json({ error: '文本类型答案必须是字符串' }, { status: 400 });
    }
    if (answerType === 'label' && !Array.isArray(answer)) {
      return NextResponse.json({ error: '标签类型答案必须是数组' }, { status: 400 });
    }

    // 序列化答案
    let answerString = answer;
    if (answerType !== 'text' && typeof answerString !== 'string') {
      answerString = JSON.stringify(answer, null, 2);
    }

    // 1. 获取问题记录（前端传递的 questionId 指向已有的问题）
    if (!questionId) {
      return NextResponse.json({ error: '缺少必要参数：questionId' }, { status: 400 });
    }

    const questionRecord = await prisma.questions.findUnique({
      where: { id: questionId }
    });

    if (!questionRecord) {
      return NextResponse.json({ error: '问题不存在' }, { status: 404 });
    }

    // 验证问题属于该图片
    if (questionRecord.imageId !== imageId) {
      return NextResponse.json({ error: '问题不属于该图片' }, { status: 400 });
    }

    // 2. 更新问题为已回答
    await prisma.questions.update({
      where: { id: questionRecord.id },
      data: { answered: true }
    });

    // 3. 创建 ImageDataset 记录
    const dataset = await createImageDataset(projectId, {
      imageId: image.id,
      imageName: image.imageName,
      questionId: questionRecord.id,
      question,
      answer: answerString,
      answerType,
      model: 'manual',
      note: note || ''
    });

    return NextResponse.json({
      success: true,
      dataset,
      questionId: questionRecord.id
    });
  } catch (error) {
    console.error('Failed to create annotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to create annotation' }, { status: 500 });
  }
}
