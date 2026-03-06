import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';

/**
 * Submit vote result
 * vote: 'left' | 'right' | 'both_good' | 'both_bad'
 * Results are stored in EvalResults table
 */
export async function POST(request, { params }) {
  try {
    const { projectId, taskId } = params;
    const { vote, questionId, isSwapped, leftAnswer, rightAnswer } = await request.json();

    // Validate vote option
    const validVotes = ['left', 'right', 'both_good', 'both_bad'];
    if (!validVotes.includes(vote)) {
      return NextResponse.json({ code: 400, error: 'Invalid vote option' }, { status: 400 });
    }

    if (!questionId) {
      return NextResponse.json({ code: 400, error: 'Question ID is required' }, { status: 400 });
    }

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

    if (task.status !== 0) {
      return NextResponse.json({ code: 400, error: 'Task has ended' }, { status: 400 });
    }

    // Parse task details
    let detail = {};
    try {
      detail = task.detail ? JSON.parse(task.detail) : {};
    } catch (e) {
      console.error('Failed to parse task detail:', e);
    }

    // Calculate scores
    // isSwapped: true means left is model B and right is model A
    // isSwapped: false means left is model A and right is model B
    let modelAScore = 0;
    let modelBScore = 0;

    if (vote === 'left') {
      if (isSwapped) {
        modelBScore = 1; // Left is B
      } else {
        modelAScore = 1; // Left is A
      }
    } else if (vote === 'right') {
      if (isSwapped) {
        modelAScore = 1; // Right is A
      } else {
        modelBScore = 1; // Right is B
      }
    } else if (vote === 'both_good') {
      modelAScore = 0.5;
      modelBScore = 0.5;
    }
    // both_bad: both scores remain 0

    // Store result in EvalResults table
    const evalResult = await db.evalResults.create({
      data: {
        projectId,
        taskId,
        evalDatasetId: questionId,
        modelAnswer: JSON.stringify({
          leftAnswer: leftAnswer || '',
          rightAnswer: rightAnswer || ''
        }),
        score: modelAScore, // Store modelA score for sorting/aggregation
        isCorrect: false, // Not applicable for blind-test
        judgeResponse: JSON.stringify({
          vote,
          isSwapped,
          modelAScore,
          modelBScore
        }),
        duration: 0,
        status: 0
      }
    });

    // Update task progress
    const evalDatasetIds = detail.evalDatasetIds || [];
    const newCurrentIndex = (detail.currentIndex || 0) + 1;
    const isCompleted = newCurrentIndex >= evalDatasetIds.length;

    const updatedDetail = {
      ...detail,
      currentIndex: newCurrentIndex
    };

    await db.task.update({
      where: { id: taskId },
      data: {
        detail: JSON.stringify(updatedDetail),
        completedCount: newCurrentIndex,
        status: isCompleted ? 1 : 0, // 1-completed, 0-running
        endTime: isCompleted ? new Date() : null
      }
    });

    // Calculate current total scores from EvalResults
    const allResults = await db.evalResults.findMany({
      where: { taskId },
      select: { judgeResponse: true }
    });

    let totalModelAScore = 0;
    let totalModelBScore = 0;
    for (const r of allResults) {
      try {
        const judge = JSON.parse(r.judgeResponse || '{}');
        totalModelAScore += judge.modelAScore || 0;
        totalModelBScore += judge.modelBScore || 0;
      } catch (e) {
        // Ignore parse errors
      }
    }

    return NextResponse.json({
      code: 0,
      data: {
        success: true,
        isCompleted,
        currentIndex: newCurrentIndex,
        totalCount: evalDatasetIds.length,
        scores: {
          modelA: totalModelAScore,
          modelB: totalModelBScore
        }
      },
      message: isCompleted ? 'Blind-test task completed' : 'Vote recorded'
    });
  } catch (error) {
    console.error('Failed to submit vote result:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to submit vote result', message: error.message },
      { status: 500 }
    );
  }
}
