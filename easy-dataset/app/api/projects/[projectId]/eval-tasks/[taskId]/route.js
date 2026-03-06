import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { getEvalResultsByTaskId, getEvalResultsStats } from '@/lib/db/evalResults';

/**
 * Get evaluation task details and results
 */
export async function GET(request, { params }) {
  try {
    const { projectId, taskId } = params;

    if (!projectId || !taskId) {
      return NextResponse.json({ error: 'Project ID and Task ID are required' }, { status: 400 });
    }

    // Fetch task details
    const task = await db.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.projectId !== projectId) {
      return NextResponse.json({ error: 'Task does not belong to this project' }, { status: 403 });
    }

    // Parse task detail fields
    let detail = {};
    let modelInfo = {};
    try {
      detail = task.detail ? JSON.parse(task.detail) : {};
      modelInfo = task.modelInfo ? JSON.parse(task.modelInfo) : {};
    } catch (e) {
      console.error('Failed to parse task detail:', e);
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const type = searchParams.get('type') || null;
    const isCorrectStr = searchParams.get('isCorrect');
    const isCorrect = isCorrectStr === 'true' ? true : isCorrectStr === 'false' ? false : null;

    // Fetch results (supports pagination and filters)
    const { items: results, total } = await getEvalResultsByTaskId(taskId, {
      page,
      pageSize,
      type,
      isCorrect
    });

    // Fetch stats
    const stats = await getEvalResultsStats(taskId);

    return NextResponse.json({
      code: 0,
      data: {
        task: {
          ...task,
          detail,
          modelInfo
        },
        results,
        total,
        page,
        pageSize,
        stats
      }
    });
  } catch (error) {
    console.error('Failed to fetch evaluation task details:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to fetch evaluation task details', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Delete evaluation task
 */
export async function DELETE(request, { params }) {
  try {
    const { projectId, taskId } = params;

    if (!projectId || !taskId) {
      return NextResponse.json({ error: 'Project ID and Task ID are required' }, { status: 400 });
    }

    // Validate task exists and belongs to this project
    const task = await db.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.projectId !== projectId) {
      return NextResponse.json({ error: 'Task does not belong to this project' }, { status: 403 });
    }

    // Delete evaluation results
    await db.evalResults.deleteMany({
      where: { taskId }
    });

    // Delete task
    await db.task.delete({
      where: { id: taskId }
    });

    return NextResponse.json({
      code: 0,
      message: 'Deleted'
    });
  } catch (error) {
    console.error('Failed to delete evaluation task:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to delete evaluation task', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Interrupt evaluation task
 */
export async function PUT(request, { params }) {
  try {
    const { projectId, taskId } = params;
    const data = await request.json();
    const { action } = data;

    if (!projectId || !taskId) {
      return NextResponse.json({ error: 'Project ID and Task ID are required' }, { status: 400 });
    }

    // Validate task exists and belongs to this project
    const task = await db.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.projectId !== projectId) {
      return NextResponse.json({ error: 'Task does not belong to this project' }, { status: 403 });
    }

    if (action === 'interrupt') {
      // Interrupt task
      await db.task.update({
        where: { id: taskId },
        data: {
          status: 3, // Interrupted
          endTime: new Date()
        }
      });

      return NextResponse.json({
        code: 0,
        message: 'Task interrupted'
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to operate evaluation task:', error);
    return NextResponse.json({ code: 500, error: 'Operation failed', message: error.message }, { status: 500 });
  }
}
