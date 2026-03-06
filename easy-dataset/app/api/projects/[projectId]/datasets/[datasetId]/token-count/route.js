import { NextResponse } from 'next/server';
import { getDatasetsById } from '@/lib/db/datasets';
import { getEncoding } from '@langchain/core/utils/tiktoken';

/**
 * 异步计算数据集文本的Token数量
 */
export async function GET(request, { params }) {
  try {
    const { projectId, datasetId } = params;

    if (!datasetId) {
      return NextResponse.json({ error: '数据集ID不能为空' }, { status: 400 });
    }

    const datasets = await getDatasetsById(datasetId);
    const tokenCounts = {
      answerTokens: 0,
      cotTokens: 0
    };

    try {
      if (datasets.answer || datasets.cot) {
        // 使用 cl100k_base 编码，适用于 gpt-3.5-turbo 和 gpt-4
        const encoding = await getEncoding('cl100k_base');

        if (datasets.answer) {
          const tokens = encoding.encode(datasets.answer);
          tokenCounts.answerTokens = tokens.length;
        }

        if (datasets.cot) {
          const tokens = encoding.encode(datasets.cot);
          tokenCounts.cotTokens = tokens.length;
        }
      }
    } catch (error) {
      console.error('计算Token数量失败:', String(error));
      return NextResponse.json({ error: '计算Token数量失败' }, { status: 500 });
    }

    return NextResponse.json(tokenCounts);
  } catch (error) {
    console.error('获取Token计数失败:', String(error));
    return NextResponse.json(
      {
        error: error.message || '获取Token计数失败'
      },
      { status: 500 }
    );
  }
}
