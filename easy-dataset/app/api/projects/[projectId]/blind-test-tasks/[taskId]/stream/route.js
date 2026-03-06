import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import LLMClient from '@/lib/llm/core/index';
import { getModelConfigById } from '@/lib/db/model-config';

/**
 * Stream answers from two models for the current question
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
    const modelInfo = JSON.parse(task.modelInfo || '{}');
    const { questionIds = [], currentIndex = 0 } = detail;

    // Check if task is completed
    if (currentIndex >= questionIds.length) {
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

    // Fetch model configs
    const [modelConfigA, modelConfigB] = await Promise.all([
      getModelConfigById(modelInfo.modelA.providerId),
      getModelConfigById(modelInfo.modelB.providerId)
    ]);

    if (!modelConfigA || !modelConfigB) {
      return NextResponse.json({ error: 'Model configuration not found' }, { status: 400 });
    }

    // Randomly swap positions (core blind-test behavior)
    const isSwapped = Math.random() > 0.5;

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send init message
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'init',
                question: currentQuestion.question,
                questionId: currentQuestion.id,
                questionIndex: currentIndex + 1,
                totalQuestions: questionIds.length,
                isSwapped
              }) + '\n'
            )
          );

          // Prepare messages
          const messages = [
            {
              role: 'system',
              content: "You are a helpful assistant. Provide detailed and accurate answers to the user's question."
            },
            { role: 'user', content: currentQuestion.question }
          ];

          // Create LLM clients
          const clientA = new LLMClient({
            projectId,
            ...modelConfigA
          });

          const clientB = new LLMClient({
            projectId,
            ...modelConfigB
          });

          let answerA = '';
          let answerB = '';
          const startTime = Date.now();

          // Call both models in parallel (streaming)
          await Promise.all([
            (async () => {
              try {
                const response = await clientA.chatStreamAPI(messages);
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = decoder.decode(value, { stream: true });
                  answerA += chunk;

                  // Send chunk update
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        type: 'chunk',
                        model: isSwapped ? 'B' : 'A',
                        content: chunk
                      }) + '\n'
                    )
                  );
                }
              } catch (err) {
                console.error('Model A call failed:', err);
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      type: 'error',
                      model: isSwapped ? 'B' : 'A',
                      error: err.message
                    }) + '\n'
                  )
                );
              }
            })(),
            (async () => {
              try {
                const response = await clientB.chatStreamAPI(messages);
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = decoder.decode(value, { stream: true });
                  answerB += chunk;

                  // Send chunk update
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        type: 'chunk',
                        model: isSwapped ? 'A' : 'B',
                        content: chunk
                      }) + '\n'
                    )
                  );
                }
              } catch (err) {
                console.error('Model B call failed:', err);
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      type: 'error',
                      model: isSwapped ? 'A' : 'B',
                      error: err.message
                    }) + '\n'
                  )
                );
              }
            })()
          ]);

          const duration = Date.now() - startTime;

          // Send done message
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'done',
                duration,
                answerA: isSwapped ? answerB : answerA,
                answerB: isSwapped ? answerA : answerB
              }) + '\n'
            )
          );

          controller.close();
        } catch (error) {
          console.error('Streaming handler failed:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
