import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { processTask } from '@/lib/services/tasks';

/**
 * Get all evaluation tasks for a project
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
          taskType: 'model-evaluation'
        },
        orderBy: { createAt: 'desc' },
        skip,
        take: pageSize
      }),
      db.task.count({
        where: {
          projectId,
          taskType: 'model-evaluation'
        }
      })
    ]);

    // Parse task detail fields
    const tasksWithDetails = tasks.map(task => {
      let detail = {};
      let modelInfo = {};
      try {
        detail = task.detail ? JSON.parse(task.detail) : {};
        modelInfo = task.modelInfo ? JSON.parse(task.modelInfo) : {};
      } catch (e) {
        console.error('Failed to parse task detail:', e);
      }
      return {
        ...task,
        detail,
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
    console.error('Failed to fetch evaluation task list:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to fetch evaluation task list', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Create evaluation tasks
 * Supports selecting multiple models and creating one task per model
 */
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const data = await request.json();

    const {
      models, // Models to evaluate: [{ modelId, providerId }]
      evalDatasetIds, // Evaluation question IDs
      judgeModelId, // Judge model ID (for subjective grading)
      judgeProviderId, // Judge provider ID
      language = 'zh-CN',
      filterOptions = {}, // Filter options (for display)
      customScoreAnchors = null // Custom score anchors for subjective grading
    } = data;

    // Validate required fields
    if (!models || models.length === 0) {
      return NextResponse.json({ code: 400, error: 'Please select at least one model to evaluate' }, { status: 400 });
    }

    if (!evalDatasetIds || evalDatasetIds.length === 0) {
      return NextResponse.json({ code: 400, error: 'Please select questions to evaluate' }, { status: 400 });
    }

    // Check for subjective questions
    const evalDatasets = await db.evalDatasets.findMany({
      where: {
        id: { in: evalDatasetIds },
        projectId
      },
      select: { questionType: true }
    });

    const hasSubjectiveQuestions = evalDatasets.some(
      q => q.questionType === 'short_answer' || q.questionType === 'open_ended'
    );

    // If there are subjective questions, a judge model is required
    if (hasSubjectiveQuestions && (!judgeModelId || !judgeProviderId)) {
      return NextResponse.json(
        { code: 400, error: 'Short-answer or open-ended questions found. Please select a judge model for grading' },
        { status: 400 }
      );
    }

    // Judge model must not be the same as any test model
    if (judgeModelId && judgeProviderId) {
      const judgeModel = { modelId: judgeModelId, providerId: judgeProviderId };
      const isJudgeInTestModels = models.some(
        m => m.modelId === judgeModel.modelId && m.providerId === judgeModel.providerId
      );
      if (isJudgeInTestModels) {
        return NextResponse.json(
          { code: 400, error: 'Judge model cannot be the same as a test model' },
          { status: 400 }
        );
      }
    }

    // Create one task per model
    const createdTasks = [];

    for (const model of models) {
      const { modelId, providerId } = model;

      // Fetch full model config
      const modelConfig = await db.modelConfig.findFirst({
        where: {
          projectId,
          providerId,
          modelId
        }
      });

      // Keep providerId for lookup, add providerName for display
      const modelInfo = {
        modelId,
        modelName: modelConfig?.modelName || modelId,
        providerId: providerId, // Provider ID (DB ID)
        providerName: modelConfig?.providerName || providerId // Provider display name
      };

      // Build task detail
      const taskDetail = {
        evalDatasetIds,
        judgeModelId: judgeModelId || null,
        judgeProviderId: judgeProviderId || null,
        filterOptions,
        hasSubjectiveQuestions,
        customScoreAnchors: customScoreAnchors || null // Store custom score anchors
      };

      // Create task
      const newTask = await db.task.create({
        data: {
          projectId,
          taskType: 'model-evaluation',
          status: 0, // Processing
          modelInfo: JSON.stringify(modelInfo),
          language,
          detail: JSON.stringify(taskDetail),
          totalCount: evalDatasetIds.length,
          completedCount: 0,
          note: ''
        }
      });

      createdTasks.push(newTask);

      // Start task processing asynchronously
      processTask(newTask.id).catch(err => {
        console.error(`Failed to start evaluation task: ${newTask.id}`, err);
      });
    }

    return NextResponse.json({
      code: 0,
      data: createdTasks,
      message: `Successfully created ${createdTasks.length} evaluation tasks`
    });
  } catch (error) {
    console.error('Failed to create evaluation task:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to create evaluation task', message: error.message },
      { status: 500 }
    );
  }
}
