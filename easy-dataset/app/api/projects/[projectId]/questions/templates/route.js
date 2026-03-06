import { NextResponse } from 'next/server';
import templateDb from '@/lib/db/questionTemplates';
import { generateQuestionsFromTemplate, checkTemplateGenerationAvailability } from '@/lib/services/questions/template';

// 获取问题模板列表
export async function GET(request, { params }) {
  try {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get('sourceType');
    const search = searchParams.get('search');

    const templates = await templateDb.getTemplates(projectId, { sourceType, search });

    // 获取使用统计
    const templateIds = templates.map(t => t.id);
    const usageCounts = await templateDb.getTemplatesUsageCount(templateIds);

    // 添加使用统计到模板数据
    const templatesWithUsage = templates.map(template => ({
      ...template,
      usageCount: usageCounts[template.id] || 0
    }));

    return NextResponse.json({
      success: true,
      templates: templatesWithUsage
    });
  } catch (error) {
    console.error('Failed to get templates:', error);
    return NextResponse.json({ error: error.message || 'Failed to get templates' }, { status: 500 });
  }
}

// 创建问题模板
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const data = await request.json();

    const { question, sourceType, answerType, description, labels, customFormat, order, autoGenerate } = data;

    // 验证必填字段
    if (!question || !sourceType || !answerType) {
      return NextResponse.json({ error: '缺少必要参数：question, sourceType, answerType' }, { status: 400 });
    }

    // 验证数据源类型
    if (!['image', 'text'].includes(sourceType)) {
      return NextResponse.json({ error: '无效的数据源类型' }, { status: 400 });
    }

    // 验证答案类型
    if (!['text', 'label', 'custom_format'].includes(answerType)) {
      return NextResponse.json({ error: '无效的答案类型' }, { status: 400 });
    }

    // 如果是标签类型，验证 labels
    if (answerType === 'label' && (!labels || !Array.isArray(labels) || labels.length === 0)) {
      return NextResponse.json({ error: '标签类型问题必须提供标签列表' }, { status: 400 });
    }

    // 如果是自定义格式，验证 customFormat
    if (answerType === 'custom_format' && !customFormat) {
      return NextResponse.json({ error: '自定义格式问题必须提供格式定义' }, { status: 400 });
    }

    const template = await templateDb.createTemplate(projectId, {
      question,
      sourceType,
      answerType,
      description,
      labels: answerType === 'label' ? labels : [],
      customFormat: answerType === 'custom_format' ? customFormat : null,
      order: order || 0
    });

    let generationResult = null;

    // 如果启用自动生成，则为所有相关数据源创建问题
    if (autoGenerate) {
      try {
        // 先检查是否有可用的数据源
        const availability = await checkTemplateGenerationAvailability(projectId, sourceType);

        if (availability.available) {
          generationResult = await generateQuestionsFromTemplate(projectId, template);
        } else {
          generationResult = {
            success: false,
            successCount: 0,
            failCount: 0,
            message: availability.message
          };
        }
      } catch (error) {
        console.error('自动生成问题失败:', error);
        generationResult = {
          success: false,
          successCount: 0,
          failCount: 0,
          message: '自动生成问题时发生错误'
        };
      }
    }

    return NextResponse.json({
      success: true,
      template,
      generation: generationResult
    });
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json({ error: error.message || 'Failed to create template' }, { status: 500 });
  }
}
