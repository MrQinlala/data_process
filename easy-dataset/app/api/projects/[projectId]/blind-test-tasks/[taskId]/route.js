import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';

/**
 * Get blind-test task details
 * Results are fetched from EvalResults table
 */
export async function GET(request, { params }) {
  try {
    const { projectId, taskId } = params;

    const task = await db.task.findFirst({
      where: {
        id: taskId,
        projectId,
        taskType: 'blind-test'
      }
    });

    if (!task) {
      return NextResponse.json({ code: 404, error: 'Task not found' }, { status: 404 });
    }

    let detail = {};
    let modelInfo = {};
    try {
      detail = task.detail ? JSON.parse(task.detail) : {};
      modelInfo = task.modelInfo ? JSON.parse(task.modelInfo) : {};
    } catch (e) {
      console.error('Failed to parse task detail:', e);
    }

    // Fetch all related evaluation questions
    const evalDatasetIds = detail.evalDatasetIds || [];
    const evalDatasets = await db.evalDatasets.findMany({
      where: {
        id: { in: evalDatasetIds }
      },
      select: {
        id: true,
        question: true,
        questionType: true,
        correctAnswer: true,
        tags: true
      }
    });

    // Sort by evalDatasetIds order
    const orderedDatasets = evalDatasetIds.map(id => evalDatasets.find(d => d.id === id)).filter(Boolean);

    // Fetch results from EvalResults table
    const evalResults = await db.evalResults.findMany({
      where: { taskId },
      orderBy: { createAt: 'asc' }
    });

    // Parse results into the format expected by frontend
    const results = evalResults.map(r => {
      let modelAnswer = {};
      let judgeData = {};
      try {
        modelAnswer = JSON.parse(r.modelAnswer || '{}');
        judgeData = JSON.parse(r.judgeResponse || '{}');
      } catch (e) {
        // Ignore parse errors
      }
      return {
        questionId: r.evalDatasetId,
        vote: judgeData.vote,
        isSwapped: judgeData.isSwapped,
        modelAScore: judgeData.modelAScore || 0,
        modelBScore: judgeData.modelBScore || 0,
        leftAnswer: modelAnswer.leftAnswer || '',
        rightAnswer: modelAnswer.rightAnswer || '',
        timestamp: r.createAt
      };
    });

    return NextResponse.json({
      code: 0,
      data: {
        ...task,
        detail: {
          ...detail,
          results // Include results from EvalResults table
        },
        modelInfo,
        evalDatasets: orderedDatasets
      }
    });
  } catch (error) {
    console.error('Failed to fetch blind-test task details:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to fetch blind-test task details', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Update blind-test task (interrupt/stop)
 */
export async function PUT(request, { params }) {
  try {
    const { projectId, taskId } = params;
    const { action } = await request.json();

    const task = await db.task.findFirst({
      where: {
        id: taskId,
        projectId,
        taskType: 'blind-test'
      }
    });

    if (!task) {
      return NextResponse.json({ code: 404, error: 'Task not found' }, { status: 404 });
    }

    if (action === 'interrupt') {
      if (task.status !== 0) {
        return NextResponse.json({ code: 400, error: 'Only running tasks can be interrupted' }, { status: 400 });
      }

      const updatedTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: 3, // Interrupted
          endTime: new Date()
        }
      });

      return NextResponse.json({
        code: 0,
        data: updatedTask,
        message: 'Task interrupted'
      });
    }

    return NextResponse.json({ code: 400, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update blind-test task:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to update blind-test task', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Delete blind-test task and its results
 */
export async function DELETE(request, { params }) {
  try {
    const { projectId, taskId } = params;

    const task = await db.task.findFirst({
      where: {
        id: taskId,
        projectId,
        taskType: 'blind-test'
      }
    });

    if (!task) {
      return NextResponse.json({ code: 404, error: 'Task not found' }, { status: 404 });
    }

    // Delete related EvalResults first
    await db.evalResults.deleteMany({
      where: { taskId }
    });

    // Then delete the task
    await db.task.delete({
      where: { id: taskId }
    });

    return NextResponse.json({
      code: 0,
      message: 'Task deleted'
    });
  } catch (error) {
    console.error('Failed to delete blind-test task:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to delete blind-test task', message: error.message },
      { status: 500 }
    );
  }
}
