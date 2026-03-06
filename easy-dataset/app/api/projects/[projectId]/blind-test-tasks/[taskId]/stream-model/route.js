import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import LLMClient from '@/lib/llm/core/index';
import { getModelConfigById } from '@/lib/db/model-config';

/**
 * Stream answer for a specified model
 * Query param: model=A or model=B
 */
export async function GET(request, { params }) {
  const { projectId, taskId } = params;
  const { searchParams } = new URL(request.url);
  const modelType = searchParams.get('model'); // 'A' or 'B'

  try {
    if (!projectId || !taskId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!modelType || !['A', 'B'].includes(modelType)) {
      return NextResponse.json({ error: 'Model type must be specified (A or B)' }, { status: 400 });
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
    const modelInfo = JSON.parse(task.modelInfo || '{}');
    // Support both evalDatasetIds and questionIds
    const questionIds = detail.questionIds || detail.evalDatasetIds || [];
    const currentIndex = detail.currentIndex || 0;

    // Check if task is completed
    if (questionIds.length === 0 || currentIndex >= questionIds.length) {
      return NextResponse.json({ completed: true });
    }

    // Fetch current question
    const currentQuestionId = questionIds[currentIndex];
    const currentQuestion = await db.evalDatasets.findUnique({
      where: { id: currentQuestionId }
    });

    if (!currentQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Resolve model config based on modelType
    const modelConfigKey = modelType === 'A' ? 'modelA' : 'modelB';
    const modelConfig = await getModelConfigById(modelInfo[modelConfigKey].id);

    if (!modelConfig) {
      return NextResponse.json({ error: 'Model configuration not found' }, { status: 400 });
    }

    // Prepare messages
    const messages = [
      {
        role: 'system',
        content: "You are a helpful assistant. Provide detailed and accurate answers to the user's question."
      },
      { role: 'user', content: currentQuestion.question }
    ];

    // Create LLM client
    const client = new LLMClient({
      projectId,
      ...modelConfig
    });

    // Call streaming API and return response directly
    const response = await client.chatStreamAPI(messages);

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    });
  } catch (error) {
    console.error(`Model ${modelType} streaming call failed:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
