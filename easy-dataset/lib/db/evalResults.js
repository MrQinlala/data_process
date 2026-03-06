'use server';
import { db } from '@/lib/db/index';

/**
 * 创建评估结果
 * @param {Object} data - 评估结果数据
 * @returns {Promise<Object>} - 创建的评估结果
 */
export async function createEvalResult(data) {
  try {
    return await db.evalResults.create({ data });
  } catch (error) {
    console.error('Failed to create eval result:', error);
    throw error;
  }
}

/**
 * 批量创建评估结果
 * @param {Array} dataArray - 评估结果数据数组
 * @returns {Promise<Object>} - 创建结果
 */
export async function createManyEvalResults(dataArray) {
  try {
    return await db.evalResults.createMany({ data: dataArray });
  } catch (error) {
    console.error('Failed to create many eval results:', error);
    throw error;
  }
}

/**
 * 获取任务的所有评估结果（支持分页和筛选）
 * @param {string} taskId - 任务ID
 * @param {Object} options - 查询选项 { page, pageSize, type, isCorrect }
 * @returns {Promise<Object>} - { items: [], total: 0 }
 */
export async function getEvalResultsByTaskId(taskId, { page = 1, pageSize = 10, type = null, isCorrect = null } = {}) {
  try {
    const where = { taskId };

    // 如果指定了题型，添加到查询条件
    if (type) {
      where.evalDataset = {
        questionType: type
      };
    }

    // 如果指定了正确性筛选
    if (isCorrect !== null) {
      where.isCorrect = isCorrect;
    }

    const [items, total] = await Promise.all([
      db.evalResults.findMany({
        where,
        include: {
          evalDataset: {
            select: {
              id: true,
              question: true,
              questionType: true,
              options: true,
              correctAnswer: true,
              tags: true
            }
          }
        },
        orderBy: { createAt: 'asc' }, // 按创建时间正序，即题目顺序
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      db.evalResults.count({ where })
    ]);

    return { items, total };
  } catch (error) {
    console.error('Failed to get eval results by task ID:', error);
    throw error;
  }
}

/**
 * 获取项目的所有评估结果
 * @param {string} projectId - 项目ID
 * @returns {Promise<Array>} - 评估结果数组
 */
export async function getEvalResultsByProjectId(projectId) {
  try {
    return await db.evalResults.findMany({
      where: { projectId },
      include: {
        evalDataset: {
          select: {
            id: true,
            question: true,
            questionType: true,
            correctAnswer: true
          }
        }
      },
      orderBy: { createAt: 'desc' }
    });
  } catch (error) {
    console.error('Failed to get eval results by project ID:', error);
    throw error;
  }
}

/**
 * 更新评估结果
 * @param {string} id - 评估结果ID
 * @param {Object} data - 更新数据
 * @returns {Promise<Object>} - 更新后的评估结果
 */
export async function updateEvalResult(id, data) {
  try {
    return await db.evalResults.update({
      where: { id },
      data
    });
  } catch (error) {
    console.error('Failed to update eval result:', error);
    throw error;
  }
}

/**
 * 批量更新评估结果（通过 taskId）
 * @param {string} taskId - 任务ID
 * @param {Object} data - 更新数据
 * @returns {Promise<Object>} - 更新结果
 */
export async function updateEvalResultsByTaskId(taskId, data) {
  try {
    return await db.evalResults.updateMany({
      where: { taskId },
      data
    });
  } catch (error) {
    console.error('Failed to update eval results by task ID:', error);
    throw error;
  }
}

/**
 * 删除任务的所有评估结果
 * @param {string} taskId - 任务ID
 * @returns {Promise<Object>} - 删除结果
 */
export async function deleteEvalResultsByTaskId(taskId) {
  try {
    return await db.evalResults.deleteMany({
      where: { taskId }
    });
  } catch (error) {
    console.error('Failed to delete eval results by task ID:', error);
    throw error;
  }
}

/**
 * 获取任务评估统计
 * @param {string} taskId - 任务ID
 * @returns {Promise<Object>} - 统计数据
 */
export async function getEvalResultsStats(taskId) {
  try {
    const results = await db.evalResults.findMany({
      where: { taskId },
      select: {
        score: true,
        isCorrect: true,
        evalDataset: {
          select: {
            questionType: true
          }
        }
      }
    });

    const totalQuestions = results.length;
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const correctCount = results.filter(r => r.isCorrect).length;

    // 按题型统计
    const byType = {};
    results.forEach(r => {
      const type = r.evalDataset.questionType;
      if (!byType[type]) {
        byType[type] = { total: 0, score: 0, correct: 0 };
      }
      byType[type].total++;
      byType[type].score += r.score;
      if (r.isCorrect) byType[type].correct++;
    });

    return {
      totalQuestions,
      totalScore,
      correctCount,
      scorePercentage: totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0,
      accuracyPercentage: totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0,
      byType
    };
  } catch (error) {
    console.error('Failed to get eval results stats:', error);
    throw error;
  }
}

/**
 * 检查评估结果是否存在
 * @param {string} taskId - 任务ID
 * @param {string} evalDatasetId - 评估题目ID
 * @returns {Promise<Object|null>} - 评估结果或 null
 */
export async function getEvalResult(taskId, evalDatasetId) {
  try {
    return await db.evalResults.findUnique({
      where: {
        taskId_evalDatasetId: {
          taskId,
          evalDatasetId
        }
      }
    });
  } catch (error) {
    console.error('Failed to get eval result:', error);
    throw error;
  }
}

/**
 * 创建或更新评估结果（upsert）
 * @param {string} taskId - 任务ID
 * @param {string} evalDatasetId - 评估题目ID
 * @param {Object} data - 评估结果数据
 * @returns {Promise<Object>} - 评估结果
 */
export async function upsertEvalResult(taskId, evalDatasetId, data) {
  try {
    return await db.evalResults.upsert({
      where: {
        taskId_evalDatasetId: {
          taskId,
          evalDatasetId
        }
      },
      update: data,
      create: {
        ...data,
        taskId,
        evalDatasetId
      }
    });
  } catch (error) {
    console.error('Failed to upsert eval result:', error);
    throw error;
  }
}
