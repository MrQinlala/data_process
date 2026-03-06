import { NextResponse } from 'next/server';
import { getImageDetailWithQuestions } from '@/lib/services/images';

// 根据图片ID获取图片详情，包含问题列表和已标注数据
export async function GET(request, { params }) {
  try {
    const { projectId, imageId } = params;

    // 调用服务层获取图片详情
    const imageData = await getImageDetailWithQuestions(projectId, imageId);

    return NextResponse.json({
      success: true,
      data: imageData
    });
  } catch (error) {
    console.error('Failed to get image details:', error);

    // 根据错误类型返回不同的状态码
    let statusCode = 500;
    if (error.message === '缺少图片ID') {
      statusCode = 400;
    } else if (error.message === '图片不存在') {
      statusCode = 404;
    } else if (error.message === '图片不属于指定项目') {
      statusCode = 403;
    }

    return NextResponse.json({ error: error.message || 'Failed to get image details' }, { status: statusCode });
  }
}
