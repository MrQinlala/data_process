import { NextResponse } from 'next/server';

const OllamaClient = require('@/lib/llm/core/providers/ollama');

// Force dynamic route to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Read host and port from query params
    const { searchParams } = new URL(request.url);
    const host = searchParams.get('host') || '127.0.0.1';
    const port = searchParams.get('port') || '11434';

    // Create Ollama API client
    const ollama = new OllamaClient({
      endpoint: `http://${host}:${port}/api`
    });
    // Fetch model list
    const models = await ollama.getModels();
    return NextResponse.json(models);
  } catch (error) {
    // console.error('fetch Ollama models error:', error);
    return NextResponse.json({ error: 'fetch Models failed' }, { status: 500 });
  }
}
