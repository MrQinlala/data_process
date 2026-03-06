/**
 * 数据集评估任务处理器
 * 处理批量数据集质量评估的异步任务
 */

import { PrismaClient } from '@prisma/client';
import { processInParallel } from '@/lib/util/async';
import { updateTask } from './index';
import { getDatasetsByPagination } from '@/lib/db/datasets';
import { evaluateDataset } from '@/lib/services/datasets/evaluation';
import { getTaskConfig } from '@/lib/db/projects';
import { TASK } from '@/constant';

const prisma = new PrismaClient();

/**
 * 处理数据集评估任务
 * @param {object} task - 任务对象
 */
export async function processDatasetEvaluationTask(task) {
  const { id: taskId, projectId, modelInfo, language } = task;

  try {
    console.log(`Starting dataset evaluation task: ${taskId}`);

    // 更新任务状态为处理中
    await updateTask(taskId, {
      status: TASK.STATUS.PROCESSING,
      startTime: new Date().toISOString()
    });

    // 解析模型信息
    const model = typeof modelInfo === 'string' ? JSON.parse(modelInfo) : modelInfo;

    if (!model || !model.modelName) {
      throw new Error('Model config is incomplete');
    }

    // 1. 查找所有未评估的数据集（score为0或null的数据集）
    console.log(`Searching unevaluated datasets in project ${projectId}...`);

    const unevaluatedDatasets = [];
    let page = 1;
    const pageSize = 2000;
    let hasMore = true;

    while (hasMore) {
      const response = await getDatasetsByPagination(projectId, page, pageSize, {
        // 不传递任何筛选条件，获取所有数据集
      });

      console.log(`Fetched page ${page}, total ${response.data?.length || 0} datasets`);

      if (response.data && response.data.length > 0) {
        // 在内存中筛选未评估的数据集
        const unscored = response.data.filter(
          dataset => !dataset.score || dataset.score === 0 || !dataset.aiEvaluation
        );
        unevaluatedDatasets.push(...unscored);

        page++;
        hasMore = response.data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`Found ${unevaluatedDatasets.length} unevaluated datasets`);

    if (unevaluatedDatasets.length === 0) {
      await updateTask(taskId, {
        status: TASK.STATUS.COMPLETED,
        endTime: new Date().toISOString(),
        completedCount: 0,
        totalCount: 0,
        note: 'No datasets require evaluation'
      });
      return;
    }

    // 获取任务配置，包括并发限制
    const taskConfig = await getTaskConfig(projectId);
    const concurrencyLimit = taskConfig.concurrencyLimit || 5;

    // 更新任务总数
    const totalCount = unevaluatedDatasets.length;
    await updateTask(taskId, {
      totalCount,
      detail: `Datasets to evaluate: ${totalCount}`,
      note: ''
    });

    // 2. 批量处理每个数据集
    let successCount = 0;
    let errorCount = 0;
    let latestTaskStatus = 0;

    // 单个数据集处理函数
    const processDataset = async dataset => {
      try {
        // 如果任务已经被标记为失败或已中断，不再继续处理
        const latestTask = await prisma.task.findUnique({ where: { id: taskId } });
        if (latestTask.status === 2 || latestTask.status === 3) {
          latestTaskStatus = latestTask.status;
          return;
        }

        // 调用数据集评估服务
        const result = await evaluateDataset(projectId, dataset.id, model, language);

        if (result.success) {
          console.log(
            `Dataset ${dataset.id} evaluated. Score: ${result.data.score}, progress: ${successCount + errorCount}/${totalCount}`
          );
          successCount++;
        } else {
          console.error(`Failed to evaluate dataset ${dataset.id}:`, result.error);
          errorCount++;
        }

        // 更新任务进度
        const progressNote = `Processed: ${successCount + errorCount}/${totalCount}, succeeded: ${successCount}, failed: ${errorCount}`;
        await updateTask(taskId, {
          completedCount: successCount + errorCount,
          detail: progressNote,
          note: progressNote
        });

        return { success: result.success, datasetId: dataset.id, ...result };
      } catch (error) {
        console.error(`Error processing dataset ${dataset.id}:`, error);
        errorCount++;

        // 更新任务进度
        const progressNote = `Processed: ${successCount + errorCount}/${totalCount}, succeeded: ${successCount}, failed: ${errorCount}`;
        await updateTask(taskId, {
          completedCount: successCount + errorCount,
          detail: progressNote,
          note: progressNote
        });

        return { success: false, datasetId: dataset.id, error: error.message };
      }
    };

    // 并行处理所有数据集，使用任务设置中的并发限制
    await processInParallel(unevaluatedDatasets, processDataset, concurrencyLimit, async (completed, total) => {});

    const evaluationResults = {
      success: successCount,
      failed: errorCount,
      results: [] // 简化结果存储
    };

    // 3. 更新任务完成状态
    if (!latestTaskStatus) {
      // 如果任务没有被中断，根据处理结果更新状态
      const finalStatus = errorCount === 0 ? TASK.STATUS.COMPLETED : TASK.STATUS.FAILED;
      const endTime = new Date().toISOString();
      const note = `Evaluation completed: ${successCount} succeeded, ${errorCount} failed`;

      await updateTask(taskId, {
        status: finalStatus,
        endTime,
        completedCount: successCount + errorCount,
        note,
        detail: `Total: ${totalCount}, succeeded: ${successCount}, failed: ${errorCount}`
      });

      console.log(`Dataset evaluation task completed: ${taskId}, ${note}`);
    }
  } catch (error) {
    console.error(`Dataset evaluation task failed: ${taskId}`, error);

    // 更新任务为失败状态
    await updateTask(taskId, {
      status: TASK.STATUS.FAILED,
      endTime: new Date().toISOString(),
      note: `Evaluation failed: ${error.message}`
    });

    throw error;
  }
}
