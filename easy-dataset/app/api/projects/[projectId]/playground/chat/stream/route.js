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

    return {
      ...incomingModel,
      ...latestModelConfig
    };
  } catch (error) {
    console.error('Failed to resolve latest model config:', String(error));
    return incomingModel;
  }
}

/**
 * Streaming chat endpoint.
 */
export async function POST(request, { params }) {
  const { projectId } = params;

  try {
    const body = await request.json();
    const { model, messages } = body;
    const resolvedModel = await resolveLatestModelConfig(projectId, model);

    if (!resolvedModel || !messages) {
      return NextResponse.json({ error: 'Missing necessary parameters' }, { status: 400 });
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

    try {
      // Stream response from provider.
      const response = await llmClient.chatStreamAPI(formattedMessages.filter(f => f.role !== 'error'));
      // Return native streaming response.
      return response;
    } catch (error) {
      console.error('Failed to call LLM API:', error);
      return NextResponse.json(
        {
          error: `Failed to call ${resolvedModel.modelId || resolvedModel.modelName || 'unknown'} model: ${error.message}`
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to process stream chat request:', String(error));
    return NextResponse.json({ error: `Failed to process stream chat request: ${error.message}` }, { status: 500 });
  }
}
