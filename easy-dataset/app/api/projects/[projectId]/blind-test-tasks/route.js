import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';

/**
 * Get all blind-test tasks for a project
 */
export async function GET(request, { params }) {
  try {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const skip = (page - 1) * pageSize;

    // Fetch task list and total count
    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where: {
          projectId,
          taskType: 'blind-test'
        },
        orderBy: { createAt: 'desc' },
        skip,
        take: pageSize
      }),
      db.task.count({
        where: {
          projectId,
          taskType: 'blind-test'
        }
      })
    ]);

    // Fetch evaluation results for all tasks to calculate scores
    const taskIds = tasks.map(t => t.id);
    const allEvalResults = await db.evalResults.findMany({
      where: { taskId: { in: taskIds } },
      select: {
        taskId: true,
        judgeResponse: true
      }
    });

    // Group results by taskId and calculate scores
    const taskScores = {};
    for (const result of allEvalResults) {
      if (!taskScores[result.taskId]) {
        taskScores[result.taskId] = { modelAScore: 0, modelBScore: 0 };
      }
      try {
        const judge = JSON.parse(result.judgeResponse || '{}');
        taskScores[result.taskId].modelAScore += judge.modelAScore || 0;
        taskScores[result.taskId].modelBScore += judge.modelBScore || 0;
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Parse task detail fields and attach scores
    const tasksWithDetails = tasks.map(task => {
      let detail = {};
      let modelInfo = {};
      try {
        detail = task.detail ? JSON.parse(task.detail) : {};
        modelInfo = task.modelInfo ? JSON.parse(task.modelInfo) : {};
      } catch (e) {
        console.error('Failed to parse task detail:', e);
      }

      // Attach calculated scores as results array
      const scores = taskScores[task.id] || { modelAScore: 0, modelBScore: 0 };
      const results = [
        {
          modelAScore: scores.modelAScore,
          modelBScore: scores.modelBScore
        }
      ];

      return {
        ...task,
        detail: {
          ...detail,
          results // Attach results for display in task card
        },
        modelInfo
      };
    });

    return NextResponse.json({
      code: 0,
      data: {
        items: tasksWithDetails,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Failed to fetch blind-test task list:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to fetch blind-test task list', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Create a blind-test task
 */
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const data = await request.json();

    const { modelA, modelB, evalDatasetIds, language = 'zh-CN' } = data;

    if (!modelA || !modelA.modelId || !modelA.providerId) {
      return NextResponse.json({ code: 400, error: 'Please select model A' }, { status: 400 });
    }

    if (!modelB || !modelB.modelId || !modelB.providerId) {
      return NextResponse.json({ code: 400, error: 'Please select model B' }, { status: 400 });
    }

    if (modelA.modelId === modelB.modelId && modelA.providerId === modelB.providerId) {
      return NextResponse.json({ code: 400, error: 'The two models must be different' }, { status: 400 });
    }

    if (!evalDatasetIds || evalDatasetIds.length === 0) {
      return NextResponse.json({ code: 400, error: 'Please select questions to evaluate' }, { status: 400 });
    }

    const evalDatasets = await db.evalDatasets.findMany({
      where: {
        id: { in: evalDatasetIds },
        projectId
      },
      select: { id: true, questionType: true }
    });

    const invalidQuestions = evalDatasets.filter(
      q => q.questionType !== 'short_answer' && q.questionType !== 'open_ended'
    );

    if (invalidQuestions.length > 0) {
      return NextResponse.json(
        {
          code: 400,
          error: 'Blind-test tasks only support short-answer and open-ended questions'
        },
        { status: 400 }
      );
    }

    // Fetch model config info
    const [modelConfigA, modelConfigB] = await Promise.all([
      db.modelConfig.findFirst({
        where: { projectId, providerId: modelA.providerId, modelId: modelA.modelId }
      }),
      db.modelConfig.findFirst({
        where: { projectId, providerId: modelB.providerId, modelId: modelB.modelId }
      })
    ]);

    // Build model info (two models)
    const modelInfo = {
      modelA: {
        id: modelConfigA?.id,
        modelId: modelA.modelId,
        modelName: modelConfigA?.modelName || modelA.modelId,
        providerId: modelA.providerId,
        providerName: modelConfigA?.providerName || modelA.providerId
      },
      modelB: {
        id: modelConfigB?.id,
        modelId: modelB.modelId,
        modelName: modelConfigB?.modelName || modelB.modelId,
        providerId: modelB.providerId,
        providerName: modelConfigB?.providerName || modelB.providerId
      }
    };

    // Build task detail (only store evalDatasetIds and currentIndex)
    const taskDetail = {
      evalDatasetIds,
      currentIndex: 0 // Current question index
    };

    // Create task
    const newTask = await db.task.create({
      data: {
        projectId,
        taskType: 'blind-test',
        status: 0, // Running
        modelInfo: JSON.stringify(modelInfo),
        language,
        detail: JSON.stringify(taskDetail),
        totalCount: evalDatasetIds.length,
        completedCount: 0,
        note: ''
      }
    });

    return NextResponse.json({
      code: 0,
      data: {
        ...newTask,
        detail: taskDetail,
        modelInfo
      },
      message: 'Blind-test task created'
    });
  } catch (error) {
    console.error('Failed to create blind-test task:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to create blind-test task', message: error.message },
      { status: 500 }
    );
  }
}
