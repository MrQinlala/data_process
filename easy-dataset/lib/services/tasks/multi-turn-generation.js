/**
 * 多轮对话生成任务处理器
 * 负责异步处理多轮对话生成任务，获取所有未生成多轮对话的问题并批量处理
 */

import { PrismaClient } from '@prisma/client';
import { processInParallel } from '@/lib/util/async';
import { updateTask } from './index';
import { generateMultiTurnConversation } from '@/lib/services/multi-turn/index';
import { getTaskConfig } from '@/lib/db/projects';
import { getAllDatasetConversations } from '@/lib/db/dataset-conversations';

const prisma = new PrismaClient();

/**
 * 处理多轮对话生成任务
 * 查询未生成多轮对话的问题并批量处理
 * @param {Object} task 任务对象
 * @returns {Promise<void>}
 */
export async function processMultiTurnGenerationTask(task) {
  try {
    console.log(`Starting multi-turn generation task: ${task.id}`);
    let modelInfo;
    try {
      modelInfo = JSON.parse(task.modelInfo);
    } catch (error) {
      throw new Error(`Failed to parse config: ${error.message}`);
    }

    // 从任务对象直接获取项目 ID
    const projectId = task.projectId;
    const taskConfig = await getTaskConfig(projectId);
    const multiTurnConfig = taskConfig;

    // 1. 获取项目中所有问题
    console.log(`Starting multi-turn generation for project ${projectId}`);
    const allQuestions = await prisma.questions.findMany({
      where: {
        projectId,
        imageId: null
      },
      select: {
        id: true,
        question: true,
        chunkId: true
      }
    });

    if (allQuestions.length === 0) {
      await updateTask(task.id, {
        status: 1, // 1 表示完成
        detail: 'No questions to process (requires questions with generated answers)',
        note: '',
        endTime: new Date()
      });
      return;
    }

    // 2. 获取已生成多轮对话的问题ID
    const existingConversations = await getAllDatasetConversations(projectId);
    const existingQuestionIds = new Set(existingConversations.map(conv => conv.questionId));

    // 3. 筛选出未生成多轮对话的问题
    const questionsWithoutMultiTurn = allQuestions.filter(q => !existingQuestionIds.has(q.id));

    // 如果没有需要处理的问题，直接完成任务
    if (questionsWithoutMultiTurn.length === 0) {
      await updateTask(task.id, {
        status: 1, // 1 表示完成
        detail: 'All questions already have multi-turn conversations',
        note: '',
        endTime: new Date()
      });
      return;
    }

    // 获取任务配置，包括并发限制
    const concurrencyLimit = taskConfig.concurrencyLimit || 2; // 多轮对话生成较复杂，默认并发数较低

    // 更新任务总数
    const totalCount = questionsWithoutMultiTurn.length;
    await updateTask(task.id, {
      totalCount,
      detail: `Questions to process: ${totalCount}`,
      note: ''
    });

    // 4. 构建多轮对话配置
    const config = {
      systemPrompt: multiTurnConfig.multiTurnSystemPrompt || '',
      scenario: multiTurnConfig.multiTurnScenario || '学术讨论',
      rounds: multiTurnConfig.multiTurnRounds || 3,
      roleA: multiTurnConfig.multiTurnRoleA || '用户',
      roleB: multiTurnConfig.multiTurnRoleB || '助手',
      model: modelInfo,
      language: task.language === 'zh-CN' ? '中文' : 'en'
    };

    // 5. 批量处理每个问题
    let successCount = 0;
    let errorCount = 0;
    let totalConversations = 0;
    let latestTaskStatus = 0;

    // 单个问题处理函数
    const processQuestion = async question => {
      try {
        // 如果任务已经被标记为失败或已中断，不再继续处理
        const latestTask = await prisma.task.findUnique({ where: { id: task.id } });
        if (latestTask.status === 2 || latestTask.status === 3) {
          latestTaskStatus = latestTask.status;
          return;
        }

        // 调用单个多轮对话生成服务
        const result = await generateMultiTurnConversation(projectId, question.id, config);

        if (result.success) {
          console.log(`Multi-turn conversation generated for question ${question.id}`);
          successCount++;
          totalConversations += 1;
        } else {
          console.error(`Failed to generate multi-turn conversation for question ${question.id}:`, result.error);
          errorCount++;
        }

        // 更新任务进度
        const progressNote = `Processed: ${successCount + errorCount}/${totalCount}, succeeded: ${successCount}, failed: ${errorCount}, conversations generated: ${totalConversations}`;
        console.log(progressNote);
        await updateTask(task.id, {
          completedCount: successCount + errorCount,
          detail: progressNote,
          note: progressNote
        });

        return {
          success: result.success,
          questionId: question.id,
          conversationCount: result.success ? 1 : 0
        };
      } catch (error) {
        console.error(`Error processing question ${question.id}:`, error);
        errorCount++;

        // 更新任务进度
        const progressNote = `Processed: ${successCount + errorCount}/${totalCount}, succeeded: ${successCount}, failed: ${errorCount}, conversations generated: ${totalConversations}`;
        await updateTask(task.id, {
          completedCount: successCount + errorCount,
          detail: progressNote,
          note: progressNote
        });

        return { success: false, questionId: question.id, error: error.message };
      }
    };

    // 并行处理所有问题，使用任务设置中的并发限制
    await processInParallel(questionsWithoutMultiTurn, processQuestion, concurrencyLimit, async (completed, total) => {
      console.log(`Multi-turn generation progress: ${completed}/${total}`);
    });

    if (!latestTaskStatus) {
      // 任务完成，更新状态
      const finalStatus = errorCount > 0 && successCount === 0 ? 2 : 1; // 如果全部失败，标记为失败；否则标记为完成
      const finalNote = `Processed: ${successCount + errorCount}/${totalCount}, succeeded: ${successCount}, failed: ${errorCount}, conversations generated: ${totalConversations}`;
      await updateTask(task.id, {
        status: finalStatus,
        completedCount: successCount + errorCount,
        detail: '',
        note: finalNote,
        endTime: new Date()
      });
    }

    console.log(`Task completed: ${task.id}`);
  } catch (error) {
    console.error('Multi-turn generation task error:', error);
    await updateTask(task.id, {
      status: 2, // 2 表示失败
      detail: `Processing failed: ${error.message}`,
      note: `Processing failed: ${error.message}`,
      endTime: new Date()
    });
  }
}

export default {
  processMultiTurnGenerationTask
};
