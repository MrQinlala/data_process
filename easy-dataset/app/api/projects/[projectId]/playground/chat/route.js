import { NextResponse } from 'next/server';
import LLMClient from '@/lib/llm/core/index';
import { getModelConfigById } from '@/lib/db/model-config';

async function resolveLatestModelConfig(projectId, incomingModel = {}) {
  const modelId = incomingModel?.id;
  if (!modelId) {
    return incomingModel;
  }

  try {
    const latestModelConfig = await getModelConfigById(modelId);
    if (!latestModelConfig) {
      return incomingModel;
    }
    if (String(latestModelConfig.projectId) !== String(projectId)) {
      return incomingModel;
    }

    // Keep transient client-only fields, but force endpoint/auth/model fields to latest DB values.
    return {
      ...incomingModel,
      ...latestModelConfig
    };
  } catch (error) {
    console.error('Failed to resolve latest model config:', String(error));
    return incomingModel;
  }
}

export async function POST(request, { params }) {
  try {
    const { projectId } = params;

    // Validate project ID.
    if (!projectId) {
      return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
    }

    // Read request payload.
    const { model, messages } = await request.json();
    const resolvedModel = await resolveLatestModelConfig(projectId, model);

    // Validate request parameters.
    if (!resolvedModel) {
      return NextResponse.json({ error: 'The model parameters cannot be empty' }, { status: 400 });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'The message list cannot be empty' }, { status: 400 });
    }

    // Use custom LLM client.
    const llmClient = new LLMClient(resolvedModel);

    // Normalize message payload for text + vision models.
    const formattedMessages = messages.map(msg => {
      // Plain text message.
      if (typeof msg.content === 'string') {
        return {
          role: msg.role,
          content: msg.content
        };
      }
      // Multimodal message (e.g. image parts).
      if (Array.isArray(msg.content)) {
        return {
          role: msg.role,
          content: msg.content
        };
      }
      // Fallback.
      return {
        role: msg.role,
        content: msg.content
      };
    });

    // Call LLM API.
    let response = '';
    try {
      const { answer, cot } = await llmClient.getResponseWithCOT(formattedMessages.filter(f => f.role !== 'error'));
      response = `<think>${cot}</think>${answer}`;
    } catch (error) {
      console.error('Failed to call LLM API:', String(error));
      return NextResponse.json(
        {
          error: `Failed to call ${resolvedModel.modelId || resolvedModel.modelName || 'unknown'} model: ${error.message}`
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Failed to process chat request:', String(error));
    return NextResponse.json({ error: `Failed to process chat request: ${error.message}` }, { status: 500 });
  }
}
