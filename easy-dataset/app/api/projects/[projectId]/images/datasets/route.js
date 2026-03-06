import { NextResponse } from 'next/server';
import { getImageByName } from '@/lib/db/images';
import imageService from '@/lib/services/images';

// 生成图像数据集
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const { imageName, question, model, language = 'zh', previewOnly = false } = await request.json();

    if (!imageName || !question) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({ error: '请选择一个视觉模型' }, { status: 400 });
    }

    // 获取图片信息
    const image = await getImageByName(projectId, imageName);
    if (!image) {
      return NextResponse.json({ error: '图片不存在' }, { status: 404 });
    }

    // 调用图片数据集生成服务
    const result = await imageService.generateDatasetForImage(projectId, image.id, question, {
      model,
      language,
      previewOnly
    });

    return NextResponse.json({
      success: true,
      answer: result.answer,
      dataset: result.dataset
    });
  } catch (error) {
    console.error('Failed to generate image dataset:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate dataset' }, { status: 500 });
  }
}
