import { NextResponse } from 'next/server';
import { getLlmProviders } from '@/lib/db/llm-providers';
import { sortProvidersByPriority } from '@/lib/util/providerLogo';

// Get LLM provider data
export async function GET() {
  try {
    const result = await getLlmProviders();
    return NextResponse.json(sortProvidersByPriority(result, item => item.id));
  } catch (error) {
    console.error('Database query error:', String(error));
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
