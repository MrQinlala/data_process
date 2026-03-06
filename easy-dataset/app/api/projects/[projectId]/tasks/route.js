import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getProjectRoot } from '@/lib/db/base';
import { getTaskConfig } from '@/lib/db/projects';
import { processTask } from '@/lib/services/tasks';
import { db } from '@/lib/db/index';

function normalizeModelEndpoint(endpoint = '') {
  let normalizedEndpoint = String(endpoint).trim();
  if (!normalizedEndpoint) {
    return '';
  }
  if (normalizedEndpoint.includes('/chat/completions')) {
    normalizedEndpoint = normalizedEndpoint.replace('/chat/completions', '');
  }
  return normalizedEndpoint;
}

function normalizeTaskModelInfo(modelInfo) {
  if (!modelInfo) {
    return {};
  }
  let parsedModelInfo = modelInfo;
  if (typeof modelInfo === 'string') {
    try {
      parsedModelInfo = JSON.parse(modelInfo);
    } catch (error) {
      return {};
    }
  }
  if (parsedModelInfo && typeof parsedModelInfo === 'object' && parsedModelInfo.endpoint) {
    parsedModelInfo.endpoint = normalizeModelEndpoint(parsedModelInfo.endpoint);
  }
  return parsedModelInfo;
}

// 获取任务配置
export async function GET(request, { params }) {
  try {
    const { projectId } = params;

    // 验证项目 ID
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 获取项目根目录
    const projectRoot = await getProjectRoot();
    const projectPath = path.join(projectRoot, projectId);

    // 检查项目是否存在
    try {
      await fs.access(projectPath);
    } catch (error) {
      return NextResponse.json({ error: 'Project does not exist' + projectPath }, { status: 404 });
    }

    const taskConfig = await getTaskConfig(projectId);
    return NextResponse.json(taskConfig);
  } catch (error) {
    console.error('Failed to obtain task configuration:', String(error));
    return NextResponse.json({ error: 'Failed to obtain task configuration' }, { status: 500 });
  }
}

// 更新任务配置
export async function PUT(request, { params }) {
  try {
    const { projectId } = params;

    // 验证项目 ID
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 获取请求体
    const taskConfig = await request.json();

    // 验证请求体
    if (!taskConfig) {
      return NextResponse.json({ error: 'Task configuration cannot be empty' }, { status: 400 });
    }

    // 获取项目根目录
    const projectRoot = await getProjectRoot();
    const projectPath = path.join(projectRoot, projectId);

    // 检查项目是否存在
    try {
      await fs.access(projectPath);
    } catch (error) {
      return NextResponse.json({ error: 'Project does not exist' }, { status: 404 });
    }

    // 获取任务配置文件路径
    const taskConfigPath = path.join(projectPath, 'task-config.json');

    // 写入任务配置文件
    await fs.writeFile(taskConfigPath, JSON.stringify(taskConfig, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Task configuration updated successfully' });
  } catch (error) {
    console.error('Failed to update task configuration:', String(error));
    return NextResponse.json({ error: 'Failed to update task configuration' }, { status: 500 });
  }
}

// 创建新任务
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const data = await request.json();

    // 验证必填字段
    const { taskType, modelInfo, language, detail = '', totalCount = 0, note } = data;

    if (!taskType) {
      return NextResponse.json(
        {
          code: 400,
          error: 'Missing required parameter: taskType'
        },
        { status: 400 }
      );
    }

    // 创建新任务
    const newTask = await db.task.create({
      data: {
        projectId,
        taskType,
        status: 0, // 初始状态: 处理中
        modelInfo: JSON.stringify(normalizeTaskModelInfo(modelInfo)),
        language: language || 'zh-CN',
        detail: detail || '',
        totalCount,
        note: note ? JSON.stringify(note) : '',
        completedCount: 0
      }
    });

    // 异步启动任务处理
    processTask(newTask.id).catch(err => {
      console.error(`Task startup failed: ${newTask.id}`, String(err));
    });

    return NextResponse.json({
      code: 0,
      data: newTask,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Failed to create task:', String(error));
    return NextResponse.json(
      {
        code: 500,
        error: 'Failed to create task',
        message: error.message
      },
      { status: 500 }
    );
  }
}
