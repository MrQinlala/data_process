import { NextResponse } from 'next/server';
import { getLlmModelsByProviderId } from '@/lib/db/llm-models';

// Get LLM models
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let providerId = searchParams.get('providerId');
    if (!providerId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }
    const models = await getLlmModelsByProviderId(providerId);
    if (!models) {
      return NextResponse.json({ error: 'LLM provider not found' }, { status: 404 });
    }
    return NextResponse.json(models);
  } catch (error) {
    console.error('Database query error:', String(error));
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

// Sync latest model list
export async function POST(request) {
  try {
    const { newModels, providerId } = await request.json();
    const models = await getLlmModelsByProviderId(providerId);
    const existingModelIds = models.map(model => model.modelId);
    const diffModels = newModels.filter(item => !existingModelIds.includes(item.modelId));
    if (diffModels.length > 0) {
      // return NextResponse.json(await createLlmModels(diffModels));
      return NextResponse.json({ message: 'No new models to insert' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'No new models to insert' }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
  }
}
