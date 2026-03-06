import { NextResponse } from 'next/server';
import { getDatasetsById } from '@/lib/db/datasets';
import LLMClient from '@/lib/llm/core/index';
import { getEvalQuestionPrompt } from '@/lib/llm/prompts/evalQuestion';
import { extractJsonFromLLMOutput } from '@/lib/llm/common/util';

export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const { datasetId, model, language, questionType = 'open_ended', count = 1 } = await request.json();

    if (!datasetId || !model) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. 获取原数据集
    const dataset = await getDatasetsById(datasetId);
    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // 2. 构建提示词
    // 将原问题和答案合并作为上下文文本
    const text = `Question: ${dataset.question}\nAnswer: ${dataset.answer}`;

    const prompt = await getEvalQuestionPrompt(language || 'zh-CN', questionType, { text, number: count }, projectId);

    // 3. 调用 LLM
    const client = new LLMClient(model);

    const response = await client.getResponse(prompt);
    const result = extractJsonFromLLMOutput(response);

    // 结果应该是一个数组
    if (!result || !Array.isArray(result)) {
      throw new Error('Failed to parse LLM output or output is not an array');
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Generate eval variant failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
