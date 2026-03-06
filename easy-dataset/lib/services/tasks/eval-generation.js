/**
 * 评估数据集批量生成任务处理服务
 */

import { PrismaClient } from '@prisma/client';
import { processInParallel } from '@/lib/util/async';
import { updateTask } from './index';
import { getTaskConfig } from '@/lib/db/projects';
import { generateEvalQuestionsForChunk } from '@/lib/services/eval';

const prisma = new PrismaClient();

/**
 * 处理评估数据集批量生成任务
 * @param {object} task - 任务对象
 * @returns {Promise<void>}
 */
export async function processEvalGenerationTask(task) {
  try {
    console.log(`Starting eval dataset generation task: ${task.id}`);

    // 解析模型信息
    let modelInfo;
    try {
      modelInfo = JSON.parse(task.modelInfo);
    } catch (error) {
      throw new Error(`Failed to parse model info: ${error.message}`);
    }

    // 获取项目配置
    const taskConfig = await getTaskConfig(task.projectId);
    const concurrencyLimit = taskConfig?.concurrencyLimit || 2;

    // 1. 查询所有还没有生成评估题目的文本块
    // 先获取所有文本块
    const allChunks = await prisma.chunks.findMany({
      where: {
        projectId: task.projectId,
        // 过滤掉特殊文本块
        NOT: {
          name: {
            in: ['Image Chunk', 'Distilled Content']
          }
        }
      }
    });

    if (allChunks.length === 0) {
      console.log(`No chunks available for eval question generation in project ${task.projectId}`);
      await updateTask(task.id, {
        status: 1,
        completedCount: 0,
        totalCount: 0,
        note: 'No chunks available for eval question generation'
      });
      return;
    }

    // 查询已经生成过评估题目的文本块ID
    const chunksWithEval = await prisma.evalDatasets.findMany({
      where: {
        projectId: task.projectId
      },
      select: {
        chunkId: true
      },
      distinct: ['chunkId']
    });

    const chunkIdsWithEval = new Set(chunksWithEval.map(item => item.chunkId).filter(Boolean));

    // 过滤出还没有生成评估题目的文本块
    const chunks = allChunks.filter(chunk => !chunkIdsWithEval.has(chunk.id));

    if (chunks.length === 0) {
      console.log(`All chunks already have eval questions for project ${task.projectId}`);
      await updateTask(task.id, {
        status: 1,
        completedCount: 0,
        totalCount: 0,
        note: 'All chunks already have eval questions'
      });
      return;
    }

    // 更新任务总数
    const totalCount = chunks.length;
    await updateTask(task.id, {
      totalCount,
      detail: `Chunks to process: ${totalCount}`
    });

    // 2. 批量处理每个文本块
    let successCount = 0;
    let errorCount = 0;
    let totalQuestionsGenerated = 0;
    let latestTaskStatus = 0;

    // 单个文本块处理函数
    const processChunk = async chunk => {
      try {
        // 如果任务已经被标记为失败或已中断，不再继续处理
        const latestTask = await prisma.task.findUnique({ where: { id: task.id } });
        if (latestTask.status === 2 || latestTask.status === 3) {
          latestTaskStatus = latestTask.status;
          return;
        }

        const result = await generateEvalQuestionsForChunk(task.projectId, chunk.id, {
          model: modelInfo,
          language: task.language || 'zh-CN'
        });

        console.log(
          `Chunk ${chunk.id} eval questions generated. Count: ${result.total}, breakdown: ${JSON.stringify(result.breakdown)}`
        );

        // 增加成功计数
        successCount++;
        totalQuestionsGenerated += result.total || 0;

        // 更新任务进度
        await updateTask(task.id, {
          completedCount: successCount + errorCount,
          detail: `Processed: ${successCount + errorCount}/${totalCount}, succeeded: ${successCount}, failed: ${errorCount}, questions generated: ${totalQuestionsGenerated}`
        });

        return { success: true, chunkId: chunk.id, result };
      } catch (error) {
        console.error(`Error processing chunk ${chunk.id}:`, error);
        errorCount++;

        // 更新任务进度
        await updateTask(task.id, {
          completedCount: successCount + errorCount,
          detail: `Processed: ${successCount + errorCount}/${totalCount}, succeeded: ${successCount}, failed: ${errorCount}, questions generated: ${totalQuestionsGenerated}`
        });

        return { success: false, chunkId: chunk.id, error: error.message };
      }
    };

    // 并行处理所有文本块，使用任务设置中的并发限制
    await processInParallel(chunks, processChunk, concurrencyLimit, async (completed, total) => {
      console.log(`Eval dataset generation progress: ${completed}/${total}`);
    });

    if (!latestTaskStatus) {
      // 任务完成，更新状态
      const finalStatus = errorCount > 0 && successCount === 0 ? 2 : 1; // 如果全部失败，标记为失败；否则标记为完成
      const finalNote = `Processed: ${successCount + errorCount}/${totalCount}, succeeded: ${successCount}, failed: ${errorCount}, questions generated: ${totalQuestionsGenerated}`;
      await updateTask(task.id, {
        status: finalStatus,
        completedCount: successCount + errorCount,
        detail: '',
        note: finalNote,
        endTime: new Date()
      });
    }

    console.log(`Eval dataset generation task completed: ${task.id}`);
  } catch (error) {
    console.error(`Eval dataset generation task failed: ${task.id}`, error);
    await updateTask(task.id, {
      status: 2,
      detail: `Processing failed: ${error.message}`,
      note: `Processing failed: ${error.message}`
    });
  }
}
