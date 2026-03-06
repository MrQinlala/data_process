import { NextResponse } from 'next/server';
import { getProjectChunks } from '@/lib/file/text-splitter';
import { getTaskConfig } from '@/lib/db/projects';
import { getChunkById } from '@/lib/db/chunks';
import { generateQuestionsForChunk, generateQuestionsForChunkWithGA } from '@/lib/services/questions';

// 批量生成问题
export async function POST(request, { params }) {
  try {
    const { projectId } = params;

    // 验证项目ID
    if (!projectId) {
      return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
    }

    // 获取请求体
    const { model, chunkIds, language = '中文', enableGaExpansion = false } = await request.json();

    if (!model) {
      return NextResponse.json({ error: 'The model cannot be empty' }, { status: 400 });
    }

    // 如果没有指定文本块ID，则获取所有文本块
    let chunks = [];
    if (!chunkIds || chunkIds.length === 0) {
      const result = await getProjectChunks(projectId);
      chunks = result.chunks || [];
    } else {
      // 获取指定的文本块
      chunks = await Promise.all(
        chunkIds.map(async chunkId => {
          const chunk = await getChunkById(chunkId);
          if (chunk) {
            return {
              id: chunk.id,
              content: chunk.content,
              length: chunk.content.length
            };
          }
          return null;
        })
      );
      chunks = chunks.filter(Boolean); // 过滤掉不存在的文本块
    }
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No valid text blocks found' }, { status: 404 });
    }

    const results = [];
    const errors = [];

    // 获取项目 task-config 信息
    const taskConfig = await getTaskConfig(projectId);
    const { questionGenerationLength } = taskConfig;
    for (const chunk of chunks) {
      try {
        // 根据文本长度自动计算问题数量
        const questionNumber = Math.floor(chunk.length / questionGenerationLength);

        let result;
        if (enableGaExpansion) {
          // 使用GA增强的问题生成
          result = await generateQuestionsForChunkWithGA(projectId, chunk.id, {
            model,
            language,
            number: questionNumber
          });
        } else {
          // 使用标准问题生成
          result = await generateQuestionsForChunk(projectId, chunk.id, {
            model,
            language,
            number: questionNumber
          });
        }

        // 统一处理返回结果格式
        if (result && result.questions && Array.isArray(result.questions)) {
          // GA增强模式的结果格式
          results.push({
            chunkId: chunk.id,
            success: true,
            questions: result.questions,
            total: result.total,
            gaExpansionUsed: result.gaExpansionUsed,
            gaPairsCount: result.gaPairsCount
          });
        } else if (result && result.labelQuestions && Array.isArray(result.labelQuestions)) {
          // 标准模式的结果格式
          results.push({
            chunkId: chunk.id,
            success: true,
            questions: result.labelQuestions,
            total: result.total,
            gaExpansionUsed: false,
            gaPairsCount: 0
          });
        } else {
          errors.push({
            chunkId: chunk.id,
            error: 'Failed to parse questions'
          });
        }
      } catch (error) {
        console.error(`Failed to generate questions for text block ${chunk.id}:`, String(error));
        errors.push({
          chunkId: chunk.id,
          error: error.message || 'Failed to generate questions'
        });
      }
    }

    // 返回生成结果
    return NextResponse.json({
      results,
      errors,
      totalSuccess: results.length,
      totalErrors: errors.length,
      totalChunks: chunks.length
    });
  } catch (error) {
    console.error('Failed to generate questions:', String(error));
    return NextResponse.json({ error: error.message || 'Failed to generate questions' }, { status: 500 });
  }
}
