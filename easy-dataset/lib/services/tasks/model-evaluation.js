/**
 * 模型评估任务处理服务
 * 调用评估服务层完成单题评估
 */

import { PrismaClient } from '@prisma/client';
import { TASK } from '@/constant';
import { updateTask } from './index';
import { getModelConfigByProjectId } from '@/lib/db/model-config';
import { evaluateSingleQuestion } from '@/lib/services/evaluation';

const prisma = new PrismaClient();

/**
 * 处理模型评估任务
 * @param {Object} task - 任务对象
 */
export async function processModelEvaluationTask(task) {
  const { id: taskId, projectId, detail, modelInfo, language } = task;

  try {
    console.log(`Model evaluation task started: ${taskId}, project: ${projectId}`);

    // 解析任务详情和模型信息
    const taskDetail = typeof detail === 'string' ? JSON.parse(detail) : detail;
    const modelInfoObj = typeof modelInfo === 'string' ? JSON.parse(modelInfo) : modelInfo;

    const { evalDatasetIds, judgeModelId, judgeProviderId, customScoreAnchors } = taskDetail;
    const { modelId, providerId } = modelInfoObj;

    console.log(
      `Using test model ${providerId}/${modelId}` +
        (judgeModelId && judgeProviderId ? `, judge model ${judgeProviderId}/${judgeModelId}` : '')
    );

    // 获取模型配置
    const modelConfigs = await getModelConfigByProjectId(projectId);
    const testModelConfig = modelConfigs.find(c => c.modelId === modelId && c.providerId === providerId);

    if (!testModelConfig) {
      throw new Error(`Test model config not found: ${providerId}/${modelId}`);
    }

    // 获取教师模型配置
    const judgeModelConfig =
      judgeModelId && judgeProviderId
        ? modelConfigs.find(c => c.modelId === judgeModelId && c.providerId === judgeProviderId)
        : null;

    // 获取要评估的题目
    const evalDatasets = await prisma.evalDatasets.findMany({
      where: { id: { in: evalDatasetIds }, projectId }
    });

    if (evalDatasets.length === 0) {
      throw new Error('No eval datasets found for this task');
    }

    console.log(`Loaded ${evalDatasets.length} eval questions for task: ${taskId}`);

    await updateTask(taskId, { totalCount: evalDatasets.length });

    let completedCount = 0;
    let totalScore = 0;

    // 逐题评估
    for (const evalDataset of evalDatasets) {
      // 检查任务是否被中断
      const currentTask = await prisma.task.findUnique({ where: { id: taskId } });
      if (currentTask.status === TASK.STATUS.INTERRUPTED) {
        console.log(
          `Model evaluation task interrupted: ${taskId}, completed: ${completedCount}/${evalDatasets.length}`
        );
        return;
      }

      try {
        // 获取该题型对应的自定义评分规则
        const scoreAnchorsForType = customScoreAnchors?.[evalDataset.questionType] || null;

        // 调用服务层进行单题评估
        const result = await evaluateSingleQuestion({
          evalDataset,
          testModelConfig,
          judgeModelConfig,
          projectId,
          language,
          customScoreAnchors: scoreAnchorsForType
        });

        // 保存评估结果
        await saveEvalResult(projectId, taskId, evalDataset.id, result);
        totalScore += result.score;
      } catch (error) {
        console.error(`Failed to evaluate question: ${evalDataset.id}`, error);
        await saveEvalResult(projectId, taskId, evalDataset.id, {
          modelAnswer: '',
          score: 0,
          isCorrect: false,
          judgeResponse: `Evaluation failed: ${error.message}`,
          duration: 0,
          status: 2, // API_ERROR
          errorMessage: error.message || 'Unknown error'
        });
      }

      completedCount++;
      if (completedCount % 10 === 0 || completedCount === evalDatasets.length) {
        console.log(
          `Model evaluation progress: ${completedCount}/${evalDatasets.length} questions completed for task ${taskId}`
        );
      }
      await updateTask(taskId, { completedCount });
    }

    // 计算最终得分并完成任务
    const finalScore = evalDatasets.length > 0 ? (totalScore / evalDatasets.length) * 100 : 0;
    const updatedDetail = {
      ...taskDetail,
      finalScore: parseFloat(finalScore.toFixed(2)),
      totalQuestions: evalDatasets.length,
      totalScore: parseFloat(totalScore.toFixed(4))
    };

    await updateTask(taskId, {
      status: TASK.STATUS.COMPLETED,
      detail: JSON.stringify(updatedDetail)
    });

    console.log(`Model evaluation task completed: ${taskId}, score: ${finalScore.toFixed(2)}%`);
  } catch (error) {
    console.error(`Model evaluation task failed: ${taskId}`, error);
    await updateTask(taskId, {
      status: TASK.STATUS.FAILED,
      note: `Evaluation failed: ${error.message}`
    });
  }
}

/**
 * 保存评估结果
 */
async function saveEvalResult(projectId, taskId, evalDatasetId, result) {
  const { modelAnswer, score, isCorrect, judgeResponse, duration = 0, status = 0, errorMessage = '' } = result;

  await prisma.evalResults.upsert({
    where: { taskId_evalDatasetId: { taskId, evalDatasetId } },
    update: {
      modelAnswer,
      score,
      isCorrect,
      judgeResponse,
      duration,
      status,
      errorMessage
    },
    create: {
      projectId,
      taskId,
      evalDatasetId,
      modelAnswer,
      score,
      isCorrect,
      judgeResponse,
      duration,
      status,
      errorMessage
    }
  });
}
