import { NextResponse } from 'next/server';
import { createDataset } from '@/lib/db/datasets';
import { nanoid } from 'nanoid';

export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const { datasets, sourceInfo } = await request.json();

    if (!datasets || !Array.isArray(datasets)) {
      return NextResponse.json({ error: 'Invalid datasets data' }, { status: 400 });
    }

    const results = [];
    const errors = [];
    let successCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < datasets.length; i++) {
      try {
        const dataset = datasets[i];

        // 安全获取与清洗字段
        const q = typeof dataset?.question === 'string' ? dataset.question.trim() : '';
        const a = typeof dataset?.answer === 'string' ? dataset.answer.trim() : '';

        // 验证必填字段：缺失则跳过
        if (!q || !a) {
          errors.push(`第 ${i + 1} 条记录缺少必填字段(question/answer)，已跳过`);
          skippedCount++;
          continue;
        }

        // 规范化可选字段
        const chunkName = dataset?.chunkName || 'Imported Data';
        const chunkContent = dataset?.chunkContent || 'Imported from external source';
        const model = dataset?.model || 'imported';
        const questionLabel = dataset?.questionLabel || '';
        const cot = typeof dataset?.cot === 'string' ? dataset.cot : '';
        const confirmed = typeof dataset?.confirmed === 'boolean' ? dataset.confirmed : false;
        const score = typeof dataset?.score === 'number' ? dataset.score : 0;
        // tags: 支持数组/字符串/对象
        let tags = '[]';
        if (Array.isArray(dataset?.tags)) {
          try {
            tags = JSON.stringify(dataset.tags);
          } catch {
            tags = '[]';
          }
        } else if (typeof dataset?.tags === 'string') {
          tags = dataset.tags;
        } else if (dataset?.tags && typeof dataset.tags === 'object') {
          try {
            tags = JSON.stringify(dataset.tags);
          } catch {
            tags = '[]';
          }
        }
        // other: 对象或字符串
        let other = '{}';
        if (typeof dataset?.other === 'string') {
          other = dataset.other;
        } else if (dataset?.other && typeof dataset.other === 'object') {
          try {
            other = JSON.stringify(dataset.other);
          } catch {
            other = '{}';
          }
        }
        const note = typeof dataset?.note === 'string' ? dataset.note : '';

        // 创建数据集记录
        const newDataset = await createDataset({
          projectId,
          questionId: nanoid(), // 生成唯一的问题ID
          question: q,
          answer: a,
          chunkName,
          chunkContent,
          model,
          questionLabel,
          cot,
          confirmed,
          score,
          tags,
          note,
          other
        });

        results.push(newDataset);
        successCount++;
      } catch (error) {
        errors.push(`第 ${i + 1} 条记录: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: successCount,
      total: datasets.length,
      failed: errors.length,
      skipped: skippedCount,
      errors,
      sourceInfo
    });
  } catch (error) {
    console.error('Import datasets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
