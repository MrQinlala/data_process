import { NextResponse } from 'next/server';
import templateDb from '@/lib/db/questionTemplates';
import { generateQuestionsFromTemplateEdit } from '@/lib/services/questions/template';

// 获取单个模板
export async function GET(request, { params }) {
  try {
    const { templateId } = params;

    const template = await templateDb.getTemplateById(templateId);

    if (!template) {
      return NextResponse.json({ error: '模板不存在' }, { status: 404 });
    }

    // 获取使用统计
    const usageCount = await templateDb.getTemplateUsageCount(templateId);

    return NextResponse.json({
      success: true,
      template: {
        ...template,
        usageCount
      }
    });
  } catch (error) {
    console.error('Failed to get template:', error);
    return NextResponse.json({ error: error.message || 'Failed to get template' }, { status: 500 });
  }
}

// 更新问题模板
export async function PUT(request, { params }) {
  try {
    const { projectId, templateId } = params;
    const data = await request.json();

    const { question, sourceType, answerType, description, labels, customFormat, order, autoGenerate } = data;

    // 验证数据源类型
    if (sourceType && !['image', 'text'].includes(sourceType)) {
      return NextResponse.json({ error: '无效的数据源类型' }, { status: 400 });
    }

    // 验证答案类型
    if (answerType && !['text', 'label', 'custom_format'].includes(answerType)) {
      return NextResponse.json({ error: '无效的答案类型' }, { status: 400 });
    }

    const updateData = {};
    if (question !== undefined) updateData.question = question;
    if (sourceType !== undefined) updateData.sourceType = sourceType;
    if (answerType !== undefined) updateData.answerType = answerType;
    if (description !== undefined) updateData.description = description;
    if (labels !== undefined) updateData.labels = labels;
    if (customFormat !== undefined) updateData.customFormat = customFormat;
    if (order !== undefined) updateData.order = order;

    const template = await templateDb.updateTemplate(templateId, updateData);

    let generationResult = null;

    // 如果启用自动生成，则为还未创建此模板问题的数据源创建问题
    if (autoGenerate) {
      try {
        generationResult = await generateQuestionsFromTemplateEdit(projectId, template);
      } catch (error) {
        console.error('编辑模式自动生成问题失败:', error);
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
    console.error('Failed to update template:', error);
    return NextResponse.json({ error: error.message || 'Failed to update template' }, { status: 500 });
  }
}

// 删除问题模板
export async function DELETE(request, { params }) {
  try {
    const { templateId } = params;

    // 检查是否有关联的问题
    const usageCount = await templateDb.getTemplateUsageCount(templateId);
    if (usageCount > 0) {
      return NextResponse.json({ error: `此模板已被 ${usageCount} 个问题使用，无法删除` }, { status: 400 });
    }

    await templateDb.deleteTemplate(templateId);

    return NextResponse.json({
      success: true,
      message: '模板删除成功'
    });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete template' }, { status: 500 });
  }
}
