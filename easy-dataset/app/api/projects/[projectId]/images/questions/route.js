import { NextResponse } from 'next/server';
import { getImageByName } from '@/lib/db/images';
import imageService from '@/lib/services/images';

// 生成图片问题
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const { imageName, count = 3, model, language = 'zh' } = await request.json();

    if (!imageName) {
      return NextResponse.json({ error: '缺少图片名称' }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({ error: '请选择一个视觉模型' }, { status: 400 });
    }

    // 获取图片信息
    const image = await getImageByName(projectId, imageName);
    if (!image) {
      return NextResponse.json({ error: '图片不存在' }, { status: 404 });
    }

    // 调用图片问题生成服务
    const result = await imageService.generateQuestionsForImage(projectId, image.id, {
      model,
      language,
      count
    });

    return NextResponse.json({
      success: true,
      questions: result.questions
    });
  } catch (error) {
    console.error('Failed to generate image questions:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate questions' }, { status: 500 });
  }
}
