/**
 * 答案生成任务处理器
 * 负责异步处理答案生成任务，获取所有未生成答案的问题并批量处理
 */

import { PrismaClient } from '@prisma/client';
import { processInParallel } from '@/lib/util/async';
import { updateTask } from './index';
import datasetService from '@/lib/services/datasets';
import { getTaskConfig } from '@/lib/db/projects';

const prisma = new PrismaClient();

/**
 * 处理答案生成任务
 * 查询未生成答案的问题并批量处理
 * @param {Object} task 任务对象
 * @returns {Promise<void>}
 */
export async function processAnswerGenerationTask(task) {
  try {
    console.log(`Starting answer generation task: ${task.id}`);

    // 解析模型信息
    let modelInfo;
    try {
      modelInfo = JSON.parse(task.modelInfo);
    } catch (error) {
      throw new Error(`Failed to parse model info: ${error.message}`);
    }

    // 从任务对象直接获取项目 ID
    const projectId = task.projectId;

    // 1. 查询未生成答案的问题
    console.log(`Starting answer generation for project ${projectId}`);
    const questionsWithoutAnswers = await prisma.questions.findMany({
      where: {
        projectId,
        answered: false, // 未生成答案的问题
        imageId: null
      }
    });

    // 如果没有需要处理的问题，直接完成任务
    if (questionsWithoutAnswers.length === 0) {
      await updateTask(task.id, {
        status: 1, // 1 表示完成
        detail: 'No questions to process',
        note: '',
        endTime: new Date()
      });
      return;
    }

    // 获取任务配置，包括并发限制
    const taskConfig = await getTaskConfig(projectId);
    const concurrencyLimit = taskConfig.concurrencyLimit || 3;

    // 更新任务总数
    const totalCount = questionsWithoutAnswers.length;
    await updateTask(task.id, {
      totalCount,
      detail: `Questions to process: ${totalCount}`,
      note: ''
    });

    // 2. 批量处理每个问题
    let successCount = 0;
    let errorCount = 0;
    let totalDatasets = 0;
    let latestTaskStatus = 0;
    const errorList = [];

    // 单个问题处理函数
    const processQuestion = async question => {
      try {
        // 如果任务已经被标记为失败或已中断，不再继续处理
        const latestTask = await prisma.task.findUnique({ where: { id: task.id } });
        if (latestTask.status === 2 || latestTask.status === 3) {
          latestTaskStatus = latestTask.status;
          return;
        }

        // 调用数据集生成服务生成答案
        const result = await datasetService.generateDatasetForQuestion(task.projectId, question.id, {
          model: modelInfo,
          language: task.language === 'zh-CN' ? '中文' : 'en'
        });
        console.log(`Answer generated for question ${question.id}, dataset ID: ${result.dataset.id}`);

        // 增加成功计数
        successCount++;
        totalDatasets++;

        // 更新任务进度
        const progressNote = `Processed: ${successCount + errorCount}/${totalCount}, succeeded: ${successCount}, failed: ${errorCount}, datasets generated: ${totalDatasets}`;
        await updateTask(task.id, {
          completedCount: successCount + errorCount,
          detail: progressNote,
          note: progressNote
        });

        return { success: true, questionId: question.id, datasetId: result.dataset.id };
      } catch (error) {
        console.error(`Error processing question ${question.id}:`, error);
        errorCount++;
        const errorMessage = error?.message || String(error);
        errorList.push({ questionId: question.id, error: errorMessage });

        // 更新任务进度
        const progressNote = `Processed: ${successCount + errorCount}/${totalCount}, succeeded: ${successCount}, failed: ${errorCount}, datasets generated: ${totalDatasets}`;
        await updateTask(task.id, {
          completedCount: successCount + errorCount,
          detail: `${progressNote}, latest error: ${errorMessage}`,
          note: progressNote
        });

        return { success: false, questionId: question.id, error: errorMessage };
      }
    };

    // 并行处理所有问题，使用任务设置中的并发限制
    await processInParallel(questionsWithoutAnswers, processQuestion, concurrencyLimit, async (completed, total) => {
      console.log(`Answer generation progress: ${completed}/${total}`);
    });

    if (!latestTaskStatus) {
      // 任务完成，更新状态
      const finalStatus = errorCount > 0 && successCount === 0 ? 2 : 1; // 如果全部失败，标记为失败；否则标记为完成
      const errorSummary = errorList
        .slice(0, 3)
        .map(item => `[${item.questionId}] ${item.error}`)
        .join(' | ');
      const finalNote = `Processed: ${successCount + errorCount}/${totalCount}, succeeded: ${successCount}, failed: ${errorCount}, datasets generated: ${totalDatasets}${errorSummary ? `, errors: ${errorSummary}` : ''}`;
      await updateTask(task.id, {
        status: finalStatus,
        completedCount: successCount + errorCount,
        detail: errorList.length ? JSON.stringify({ errors: errorList.slice(0, 20) }) : '',
        note: finalNote,
        endTime: new Date()
      });
    }

    console.log(`Task completed: ${task.id}`);
  } catch (error) {
    console.error('Answer generation task error:', error);
    await updateTask(task.id, {
      status: 2, // 2 表示失败
      detail: `Processing failed: ${error.message}`,
      note: `Processing failed: ${error.message}`,
      endTime: new Date()
    });
  }
}

export default {
  processAnswerGenerationTask
};
