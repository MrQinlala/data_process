import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';

/**
 * Get current question info (including random swap info)
 */
export async function GET(request, { params }) {
  const { projectId, taskId } = params;

  try {
    if (!projectId || !taskId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch task
    const task = await db.task.findUnique({
      where: { id: taskId }
    });

    if (!task || task.taskType !== 'blind-test') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Parse task detail
    const detail = JSON.parse(task.detail || '{}');
    // Support both evalDatasetIds and questionIds
    const questionIds = detail.questionIds || detail.evalDatasetIds || [];
    const currentIndex = detail.currentIndex || 0;

    // Check if task is completed
    if (questionIds.length === 0 || currentIndex >= questionIds.length) {
      return NextResponse.json({
        completed: true,
        currentIndex,
        totalQuestions: questionIds.length
      });
    }

    // Fetch current question
    const currentQuestionId = questionIds[currentIndex];
    const currentQuestion = await db.evalDatasets.findUnique({
      where: { id: currentQuestionId }
    });

    if (!currentQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Randomly decide whether to swap (core blind-test behavior)
    const isSwapped = Math.random() > 0.5;

    return NextResponse.json({
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answer: currentQuestion.correctAnswer || '',
      questionIndex: currentIndex + 1,
      totalQuestions: questionIds.length,
      isSwapped
    });
  } catch (error) {
    console.error('Failed to fetch question info:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
