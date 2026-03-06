import { db } from '@/lib/db/index';

/**
 * 创建单个测评题目
 * @param {Object} data - 题目数据
 * @returns {Promise<Object>} - 创建的题目
 */
export async function createEvalQuestion(data) {
  try {
    return await db.evalDatasets.create({ data });
  } catch (error) {
    console.error('Failed to create eval question:', error);
    throw error;
  }
}

/**
 * 批量创建测评题目
 * @param {Array} dataArray - 题目数据数组
 * @returns {Promise<Object>} - 创建结果
 */
export async function createManyEvalQuestions(dataArray) {
  try {
    return await db.evalDatasets.createMany({ data: dataArray });
  } catch (error) {
    console.error('Failed to create many eval questions:', error);
    throw error;
  }
}

/**
 * 获取项目的所有测评题目（简单查询）
 * @param {string} projectId - 项目ID
 * @returns {Promise<Array>} - 测评题目数组
 */
export async function getEvalQuestions(projectId) {
  try {
    return await db.evalDatasets.findMany({
      where: { projectId },
      orderBy: { createAt: 'desc' }
    });
  } catch (error) {
    console.error('Failed to get eval questions from database:', error);
    throw error;
  }
}

/**
 * 分页获取项目的测评题目
 * @param {string} projectId - 项目ID
 * @param {Object} options - 查询选项
 * @param {number} options.page - 页码
 * @param {number} options.pageSize - 每页数量
 * @param {string} options.questionType - 题型筛选
 * @param {string} options.keyword - 关键词搜索
 * @param {string} options.chunkId - 文本块ID筛选
 * @param {string|string[]} options.tags - 标签筛选（支持多选）
 * @returns {Promise<Object>} - 分页结果
 */
export function buildEvalQuestionWhere(projectId, { questionType, questionTypes, keyword, chunkId, tags } = {}) {
  const where = { projectId };

  const types =
    Array.isArray(questionTypes) && questionTypes.length > 0 ? questionTypes : questionType ? [questionType] : [];

  if (types.length === 1) {
    where.questionType = types[0];
  } else if (types.length > 1) {
    where.questionType = { in: types };
  }

  if (chunkId) {
    where.chunkId = chunkId;
  }

  if (tags) {
    if (Array.isArray(tags) && tags.length > 0) {
      where.OR = tags.map(tag => ({
        tags: {
          contains: tag
        }
      }));
    } else if (typeof tags === 'string' && tags.trim()) {
      const tagList = tags.split(',').filter(t => t.trim());
      if (tagList.length > 0) {
        where.OR = tagList.map(tag => ({
          tags: {
            contains: tag.trim()
          }
        }));
      }
    }
  }

  if (keyword) {
    where.question = {
      contains: keyword
    };
  }

  return where;
}

export async function getEvalQuestionsWithPagination(projectId, options = {}) {
  try {
    const { page = 1, pageSize = 20, questionType, questionTypes, keyword, chunkId, tags } = options;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where = buildEvalQuestionWhere(projectId, { questionType, questionTypes, keyword, chunkId, tags });

    // 并行查询数据和总数
    const [items, total] = await Promise.all([
      db.evalDatasets.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createAt: 'desc' },
        include: {
          chunks: {
            select: {
              id: true,
              name: true,
              fileName: true
            }
          }
        }
      }),
      db.evalDatasets.count({ where })
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  } catch (error) {
    console.error('Failed to get eval questions with pagination:', error);
    throw error;
  }
}

/**
 * 获取单个测评题目详情
 * @param {string} id - 题目ID
 * @returns {Promise<Object>} - 题目详情
 */
export async function getEvalQuestionById(id) {
  try {
    return await db.evalDatasets.findUnique({
      where: { id },
      include: {
        chunks: {
          select: {
            id: true,
            name: true,
            fileName: true,
            content: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to get eval question by ID:', error);
    throw error;
  }
}

/**
 * 更新测评题目
 * @param {string} id - 题目ID
 * @param {Object} data - 更新数据
 * @returns {Promise<Object>} - 更新后的题目
 */
export async function updateEvalQuestion(id, data) {
  try {
    return await db.evalDatasets.update({
      where: { id },
      data
    });
  } catch (error) {
    console.error('Failed to update eval question:', error);
    throw error;
  }
}

/**
 * 获取项目测评题目统计
 * @param {string} projectId - 项目ID
 * @returns {Promise<Object>} - 统计数据
 */
export async function getEvalQuestionsStats(projectId) {
  try {
    const [total, byType, allTags] = await Promise.all([
      db.evalDatasets.count({ where: { projectId } }),
      db.evalDatasets.groupBy({
        by: ['questionType'],
        where: { projectId },
        _count: { id: true }
      }),
      db.evalDatasets.findMany({
        where: { projectId },
        select: { tags: true }
      })
    ]);

    const typeStats = {};
    byType.forEach(item => {
      typeStats[item.questionType] = item._count.id;
    });

    // 统计标签
    const tagStats = {};
    allTags.forEach(item => {
      if (item.tags) {
        // 支持中英文逗号分隔
        const tags = item.tags
          .split(/[,，]/)
          .map(t => t.trim())
          .filter(Boolean);
        tags.forEach(tag => {
          tagStats[tag] = (tagStats[tag] || 0) + 1;
        });
      }
    });

    return {
      total,
      byType: typeStats,
      byTag: tagStats
    };
  } catch (error) {
    console.error('Failed to get eval questions stats:', error);
    throw error;
  }
}

/**
 * 根据文本块ID获取测评题目
 * @param {string} chunkId - 文本块ID
 * @returns {Promise<Array>} - 测评题目数组
 */
export async function getEvalQuestionsByChunkId(chunkId) {
  try {
    return await db.evalDatasets.findMany({
      where: { chunkId },
      orderBy: { createAt: 'desc' }
    });
  } catch (error) {
    console.error('Failed to get eval questions by chunk ID:', error);
    throw error;
  }
}

/**
 * 删除测评题目
 * @param {string} id - 题目ID
 * @returns {Promise<Object>} - 删除的题目
 */
export async function deleteEvalQuestion(id) {
  try {
    return await db.evalDatasets.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Failed to delete eval question:', error);
    throw error;
  }
}
