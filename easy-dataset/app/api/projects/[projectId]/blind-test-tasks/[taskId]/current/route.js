import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import LLMClient from '@/lib/llm/core/index';
import { getModelConfigById } from '@/lib/db/model-config';

/**
 * Get current question and generate answers from two models
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

    if (task.status !== 0) {
      return NextResponse.json({ code: 400, error: 'Task has ended' }, { status: 400 });
    }

    // Parse task detail
    let detail = {};
    let modelInfo = {};
    try {
      detail = task.detail ? JSON.parse(task.detail) : {};
      modelInfo = task.modelInfo ? JSON.parse(task.modelInfo) : {};
    } catch (e) {
      console.error('Failed to parse task detail:', e);
    }

    const questionIds = detail.questionIds || detail.evalDatasetIds || [];
    const currentIndex = detail.currentIndex || 0;

    // Check if all questions are completed
    if (questionIds.length === 0 || currentIndex >= questionIds.length) {
      return NextResponse.json({
        code: 0,
        data: {
          completed: true,
          message: 'All questions completed'
        }
      });
    }

    // Fetch current question
    const currentQuestionId = questionIds[currentIndex];
    const currentQuestion = await db.evalDatasets.findUnique({
      where: { id: currentQuestionId },
      select: {
        id: true,
        question: true,
        questionType: true,
        correctAnswer: true,
        tags: true
      }
    });

    if (!currentQuestion) {
      return NextResponse.json({ code: 404, error: 'Question not found' }, { status: 404 });
    }

    // Fetch both model configs
    const [modelConfigA, modelConfigB] = await Promise.all([
      getModelConfigById(modelInfo.modelA.providerId),
      getModelConfigById(modelInfo.modelB.providerId)
    ]);

    if (!modelConfigA || !modelConfigB) {
      return NextResponse.json({ code: 400, error: 'Model configuration not found' }, { status: 400 });
    }

    // Build prompts
    const systemPrompt = "You are a helpful assistant. Provide detailed and accurate answers to the user's question.";
    const userPrompt = currentQuestion.question;

    // Call both models in parallel
    const startTimeA = Date.now();
    const startTimeB = Date.now();

    let answerA = '';
    let answerB = '';
    let errorA = null;
    let errorB = null;
    let durationA = 0;
    let durationB = 0;

    try {
      // Call model A
      const clientA = new LLMClient(modelConfigA);

      const resultA = await clientA.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      answerA = resultA.text || '';
      durationA = Date.now() - startTimeA;
    } catch (err) {
      console.error('Model A call failed:', err);
      errorA = err.message;
      durationA = Date.now() - startTimeA;
    }

    try {
      // Call model B
      const clientB = new LLMClient(modelConfigB);

      const resultB = await clientB.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      answerB = resultB.text || '';
      durationB = Date.now() - startTimeB;
    } catch (err) {
      console.error('Model B call failed:', err);
      errorB = err.message;
      durationB = Date.now() - startTimeB;
    }

    // Randomly swap positions (core blind-test behavior)
    const isSwapped = Math.random() > 0.5;

    return NextResponse.json({
      code: 0,
      data: {
        completed: false,
        currentIndex,
        totalCount: evalDatasetIds.length,
        question: currentQuestion,
        // Blind test: do not reveal which model is which
        leftAnswer: {
          content: isSwapped ? answerB : answerA,
          error: isSwapped ? errorB : errorA,
          duration: isSwapped ? durationB : durationA
        },
        rightAnswer: {
          content: isSwapped ? answerA : answerB,
          error: isSwapped ? errorA : errorB,
          duration: isSwapped ? durationA : durationB
        },
        // Server stores the actual mapping for scoring
        _swap: isSwapped
      }
    });
  } catch (error) {
    console.error('Failed to fetch current question:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to fetch current question', message: error.message },
      { status: 500 }
    );
  }
}
