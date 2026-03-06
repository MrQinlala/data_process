/**
 * 批量数据集评估任务API
 * 创建批量评估数据集质量的异步任务
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { processTask } from '@/lib/services/tasks/index';

/**
 * 创建批量数据集评估任务
 */
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const { model, language = 'zh-CN' } = await request.json();

    if (!projectId) {
      return NextResponse.json({ success: false, message: '项目ID不能为空' }, { status: 400 });
    }

    if (!model || !model.modelId) {
      return NextResponse.json({ success: false, message: '模型配置不能为空' }, { status: 400 });
    }

    // 创建批量评估任务
    const newTask = await db.task.create({
      data: {
        projectId,
        taskType: 'dataset-evaluation',
        status: 0, // 初始状态: 处理中
        modelInfo: JSON.stringify(model),
        language: language || 'zh-CN',
        detail: '',
        totalCount: 0,
        note: '准备开始批量评估数据集质量...',
        completedCount: 0
      }
    });

    // 异步处理任务
    processTask(newTask.id).catch(err => {
      console.error(`批量评估任务启动失败: ${newTask.id}`, String(err));
    });

    return NextResponse.json({
      success: true,
      message: '批量评估任务已创建',
      data: { taskId: newTask.id }
    });
  } catch (error) {
    console.error('创建批量评估任务失败:', error);
    return NextResponse.json({ success: false, message: `创建任务失败: ${error.message}` }, { status: 500 });
  }
}
