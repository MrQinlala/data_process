import { NextResponse } from 'next/server';
import { getDatasetsById, updateDataset } from '@/lib/db/datasets';
import { getQuestionById } from '@/lib/db/questions';
import { getChunkById } from '@/lib/db/chunks';
import LLMClient from '@/lib/llm/core/index';
import { getNewAnswerPrompt } from '@/lib/llm/prompts/newAnswer';
import { extractJsonFromLLMOutput } from '@/lib/llm/common/util';

// 优化数据集答案
export async function POST(request, { params }) {
  try {
    const { projectId } = params;

    // 验证项目ID
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID cannot be empty' }, { status: 400 });
    }

    // 获取请求体
    const { datasetId, model, advice, language } = await request.json();

    if (!datasetId) {
      return NextResponse.json({ error: 'Dataset ID cannot be empty' }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({ error: 'Model cannot be empty' }, { status: 400 });
    }

    if (!advice) {
      return NextResponse.json({ error: 'Please provide optimization suggestions' }, { status: 400 });
    }

    // 获取数据集内容
    const dataset = await getDatasetsById(datasetId);
    if (!dataset) {
      return NextResponse.json({ error: 'Dataset does not exist' }, { status: 404 });
    }

    // 创建LLM客户端
    const llmClient = new LLMClient(model);

    const { question, answer, cot, chunkContent: storedChunkContent, questionId } = dataset;

    let chunkContent = storedChunkContent || '';

    if (!chunkContent && questionId) {
      try {
        const questionRecord = await getQuestionById(questionId);
        if (questionRecord?.chunkId) {
          const chunkRecord = await getChunkById(questionRecord.chunkId);
          chunkContent = chunkRecord?.content || '';
        }
      } catch (error) {
        console.error('Failed to load chunk content by questionId:', error);
      }
    }

    // 生成优化后的答案和思维链
    const prompt = await getNewAnswerPrompt(language, { question, answer, cot, advice, chunkContent }, projectId);

    const response = await llmClient.getResponse(prompt);

    // 从LLM输出中提取JSON格式的优化结果
    const optimizedResult = extractJsonFromLLMOutput(response);

    if (!optimizedResult || !optimizedResult.answer) {
      return NextResponse.json({ error: 'Failed to optimize answer, please try again' }, { status: 500 });
    }

    // 更新数据集
    const updatedDataset = {
      ...dataset,
      answer: optimizedResult.answer,
      cot: cot ? optimizedResult.cot || cot : '' // 如果没有提供思考过程，则不更新
    };

    await updateDataset(updatedDataset);

    // 返回优化后的数据集
    return NextResponse.json({
      success: true,
      dataset: updatedDataset
    });
  } catch (error) {
    console.error('Failed to optimize answer:', String(error));
    return NextResponse.json({ error: error.message || 'Failed to optimize answer' }, { status: 500 });
  }
}
