'use server';
import { db } from '@/lib/db/index';

/**
 * 获取项目的所有问题
 * @param {string} projectId - 项目ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页大小
 * @param answered
 * @param input
 * @param chunkName - 文本块名称筛选
 * @param sourceType - 数据源类型筛选 ('all', 'text', 'image')
 * @param searchMatchMode - 搜索匹配模式 ('match', 'notMatch')
 * @returns {Promise<{data: Array, total: number}>} - 问题列表和总条数
 */
export async function getQuestions(
  projectId,
  page = 1,
  pageSize = 10,
  answered,
  input,
  chunkName,
  sourceType = 'all',
  searchMatchMode = 'match'
) {
  try {
    const whereClause = {
      projectId,
      ...(answered !== undefined && { answered: answered }), // 确保 answered 是布尔值
      ...(input &&
        searchMatchMode === 'match' && { OR: [{ question: { contains: input } }, { label: { contains: input } }] }),
      ...(input && searchMatchMode === 'notMatch' && { question: { not: { contains: input } } }),
      ...(chunkName && { chunk: { name: { contains: chunkName } } }),
      ...(sourceType === 'text' && { imageId: null }),
      ...(sourceType === 'image' && { imageId: { not: null } })
    };

    const [data, total] = await Promise.all([
      db.questions.findMany({
        where: whereClause,
        orderBy: {
          createAt: 'desc'
        },
        include: {
          chunk: {
            select: {
              name: true,
              content: true
            }
          }
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      db.questions.count({
        where: whereClause
      })
    ]);

    // 批量查询 datasetCount
    const datasetCounts = await getDatasetCountsForQuestions(data.map(item => item.id));

    // 合并 datasetCount 到问题项中
    const questionsWithDatasetCount = data.map((item, index) => ({
      ...item,
      datasetCount: datasetCounts[index]
    }));

    return { data: questionsWithDatasetCount, total };
  } catch (error) {
    console.error('Failed to get questions by projectId in database');
    throw error;
  }
}

/**
 * 获取项目的所有问题（仅ID和标签），用于树形视图
 * @param {string} projectId - 项目ID
 * @param {string} input - 搜索关键词
 * @param {boolean} isDistill - 是否只查询蒸馏问题
 * @param {boolean} excludeImage - 是否排除图片问题（label='image'），默认为 true
 * @returns {Promise<Array>} - 问题列表（仅包含ID和标签）
 */
export async function getQuestionsForTree(projectId, input, isDistill = false, excludeImage = true) {
  try {
    // console.log('[getQuestionsForTree] 参数:', { projectId, input, isDistill, excludeImage });

    // 如果是蒸馏问题，需要先获取蒸馏文本块
    let whereClause = {
      projectId,
      question: { contains: input || '' }
    };

    // 排除图片问题
    if (excludeImage) {
      whereClause.label = { not: 'image' };
    }

    if (isDistill) {
      // 获取蒸馏文本块
      const distillChunk = await db.chunks.findFirst({
        where: {
          projectId,
          name: 'Distilled Content'
        }
      });

      if (distillChunk) {
        whereClause.chunkId = distillChunk.id;
      }
    }

    const data = await db.questions.findMany({
      where: whereClause,
      select: {
        id: true,
        label: true,
        answered: true
      },
      orderBy: {
        createAt: 'desc'
      }
    });

    return data;
  } catch (error) {
    console.error('获取树形视图问题失败:', error);
    throw error;
  }
}

/**
 * 根据标签获取项目的问题
 * @param {string} projectId - 项目ID
 * @param {string} tag - 标签名称
 * @param {string} input - 搜索关键词
 * @param {boolean} isDistill - 是否只查询蒸馏问题
 * @param {boolean} excludeImage - 是否排除图片问题（label='image'），默认为 true
 * @returns {Promise<Array>} - 问题列表
 */
export async function getQuestionsByTag(projectId, tag, input, isDistill = false, excludeImage = true) {
  try {
    const whereClause = {
      projectId
    };

    if (input) {
      whereClause.question = { contains: input };
    }

    if (tag === 'uncategorized') {
      const { getTags } = await import('./tags');
      const tagsData = await getTags(projectId);

      const extractAllLabels = tags => {
        const labels = [];
        tags.forEach(tag => {
          labels.push(tag.label);
          if (tag.child && tag.child.length > 0) {
            labels.push(...extractAllLabels(tag.child));
          }
        });
        return labels;
      };

      const allTagLabels = extractAllLabels(tagsData || []);

      const orConditions = [];

      if (excludeImage) {
        if (allTagLabels.length > 0) {
          orConditions.push({
            AND: [{ label: { notIn: [...allTagLabels, 'image'] } }]
          });
        }

        // console.log('orConditions:', orConditions);
      } else {
        orConditions.push({ label: null }, { label: '' });

        if (allTagLabels.length > 0) {
          orConditions.push({ label: { notIn: allTagLabels } });
        }
      }

      whereClause.OR = orConditions;
    } else {
      if (excludeImage && tag === 'image') {
        return []; // 不返回任何问题
      }
      whereClause.label = { in: [tag] };
    }

    // 如果是蒸馏问题，需要先获取蒸馏文本块
    if (isDistill) {
      // 获取蒸馏文本块
      const distillChunk = await db.chunks.findFirst({
        where: {
          projectId,
          name: 'Distilled Content'
        }
      });

      if (distillChunk) {
        whereClause.chunkId = distillChunk.id;
      }
    }

    const data = await db.questions.findMany({
      where: whereClause,
      include: {
        chunk: {
          select: {
            name: true,
            content: true
          }
        }
      },
      orderBy: {
        createAt: 'desc'
      }
    });

    // 批量查询 datasetCount
    const datasetCounts = await getDatasetCountsForQuestions(data.map(item => item.id));

    // 合并 datasetCount 到问题项中
    const questionsWithDatasetCount = data.map((item, index) => ({
      ...item,
      datasetCount: datasetCounts[index]
    }));

    return questionsWithDatasetCount;
  } catch (error) {
    console.error(`根据标签获取问题失败 (${tag}):`, error);
    throw error;
  }
}

export async function getAllQuestionsByProjectId(projectId) {
  try {
    return await db.questions.findMany({
      where: { projectId },
      include: {
        chunk: {
          select: {
            name: true,
            content: true
          }
        }
      },
      orderBy: {
        createAt: 'desc'
      }
    });
  } catch (error) {
    console.error('Failed to get datasets ids in database');
    throw error;
  }
}

export async function getQuestionsIds(
  projectId,
  answered,
  input,
  chunkName,
  sourceType = 'all',
  searchMatchMode = 'match'
) {
  try {
    const whereClause = {
      projectId,
      ...(answered !== undefined && { answered: answered }), // 确保 answered 是布尔值
      ...(input &&
        searchMatchMode === 'match' && { OR: [{ question: { contains: input } }, { label: { contains: input } }] }),
      ...(input && searchMatchMode === 'notMatch' && { question: { not: { contains: input } } }),
      ...(chunkName && { chunk: { name: { contains: chunkName } } }),
      ...(sourceType === 'text' && { imageId: null }),
      ...(sourceType === 'image' && { imageId: { not: null } })
    };

    // 对于大数据量，添加限制以防止内存溢出
    const MAX_SELECTION = 10000; // 最多允许全选10000条

    const count = await db.questions.count({ where: whereClause });

    if (count > MAX_SELECTION) {
      console.warn(`尝试选择 ${count} 条问题，超过限制 ${MAX_SELECTION}，将只返回前 ${MAX_SELECTION} 条`);
    }

    return await db.questions.findMany({
      where: whereClause,
      select: {
        id: true
      },
      orderBy: {
        createAt: 'desc'
      },
      take: Math.min(count, MAX_SELECTION) // 限制最大数量
    });
  } catch (error) {
    console.error('Failed to get datasets ids in database');
    throw error;
  }
}

export async function getQuestionsByTagName(projectId, tagName) {
  try {
    return await db.questions.findMany({
      where: {
        projectId,
        label: tagName
      },
      include: {
        chunk: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createAt: 'desc'
      }
    });
  } catch (error) {
    console.error('Failed to get datasets ids in database');
    throw error;
  }
}

/**
 * 批量获取问题的 datasetCount
 * 包含普通数据集、图片数据集和多轮对话数据集
 * @param {Array<string>} questionIds - 问题ID列表
 * @returns {Promise<Array<number>>} - 每个问题的 datasetCount 列表
 */
async function getDatasetCountsForQuestions(questionIds) {
  // 如果问题数量为0，直接返回空数组
  if (questionIds.length === 0) {
    return [];
  }

  // 分批处理，避免 Prisma 参数限制（每批最多1000个）
  const BATCH_SIZE = 1000;
  const batches = [];
  for (let i = 0; i < questionIds.length; i += BATCH_SIZE) {
    batches.push(questionIds.slice(i, i + BATCH_SIZE));
  }

  // 1. 统计普通数据集（Datasets 表）- 分批查询
  const datasetCountsArray = await Promise.all(
    batches.map(batch =>
      db.datasets.groupBy({
        by: ['questionId'],
        _count: {
          questionId: true
        },
        where: {
          questionId: {
            in: batch
          }
        }
      })
    )
  );
  const datasetCounts = datasetCountsArray.flat();

  // 2. 统计多轮对话数据集（datasetConversations 表）- 分批查询
  const multiTurnCountsArray = await Promise.all(
    batches.map(batch =>
      db.datasetConversations.groupBy({
        by: ['questionId'],
        _count: {
          questionId: true
        },
        where: {
          questionId: {
            in: batch
          }
        }
      })
    )
  );
  const multiTurnCounts = multiTurnCountsArray.flat();

  // 3. 对于图片问题，通过 imageId + question 统计 ImageDatasets
  // 先获取图片问题的 imageId 和问题文本 - 分批查询
  const imageQuestionsArray = await Promise.all(
    batches.map(batch =>
      db.questions.findMany({
        where: {
          id: {
            in: batch
          },
          imageId: {
            not: null
          }
        },
        select: {
          id: true,
          imageId: true,
          question: true
        }
      })
    )
  );
  const imageQuestions = imageQuestionsArray.flat();

  // 统计图片数据集
  const imageDatasetCounts = [];
  if (imageQuestions.length > 0) {
    // 为每个图片问题统计对应的数据集数量
    const countPromises = imageQuestions.map(async q => {
      const count = await db.imageDatasets.count({
        where: {
          imageId: q.imageId,
          question: q.question
        }
      });
      return { questionId: q.id, count };
    });

    const counts = await Promise.all(countPromises);
    counts.forEach(item => {
      if (item.count > 0) {
        imageDatasetCounts.push({
          questionId: item.questionId,
          _count: { questionId: item.count }
        });
      }
    });
  }

  // 合并所有统计结果
  const totalCountMap = {};

  // 添加普通数据集统计
  datasetCounts.forEach(item => {
    totalCountMap[item.questionId] = (totalCountMap[item.questionId] || 0) + item._count.questionId;
  });

  // 添加多轮对话数据集统计
  multiTurnCounts.forEach(item => {
    totalCountMap[item.questionId] = (totalCountMap[item.questionId] || 0) + item._count.questionId;
  });

  // 添加图片数据集统计
  imageDatasetCounts.forEach(item => {
    totalCountMap[item.questionId] = (totalCountMap[item.questionId] || 0) + item._count.questionId;
  });

  // 返回与 questionIds 顺序对应的 datasetCount 列表
  return questionIds.map(id => totalCountMap[id] || 0);
}

export async function getQuestionById(id) {
  try {
    return await db.questions.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error('Failed to get questions by name in database');
    throw error;
  }
}

export async function isExistByQuestion(question, projectId) {
  try {
    const count = await db.questions.count({
      where: {
        question,
        projectId
      }
    });
    return count > 0;
  } catch (error) {
    console.error('Failed to get questions by name in database');
    throw error;
  }
}

export async function getQuestionsCount(projectId) {
  try {
    return await db.questions.count({
      where: {
        projectId
      }
    });
  } catch (error) {
    console.error('Failed to get questions count in database');
    throw error;
  }
}

/**
 * 保存项目的问题列表
 * @param {string} projectId - 项目ID
 * @param {Array} questions - 问题列表
 * @param chunkId
 * @returns {Promise<Array>} - 保存后的问题列表
 */
export async function saveQuestions(projectId, questions, chunkId) {
  try {
    let data = questions.map(item => {
      return {
        projectId,
        chunkId: chunkId ? chunkId : item.chunkId,
        question: item.question,
        label: item.label,
        imageId: item.imageId,
        imageName: item.imageName,
        templateId: item.templateId
      };
    });
    return await db.questions.createMany({ data: data });
  } catch (error) {
    console.error('Failed to create questions in database');
    throw error;
  }
}

export async function updateQuestion(question) {
  try {
    return await db.questions.update({ where: { id: question.id }, data: question });
  } catch (error) {
    console.error('Failed to update questions in database');
    throw error;
  }
}

/**
 * 更新图片问题的 answered 状态
 * @param {string} projectId - 项目ID
 * @param {string} imageId - 图片ID
 * @param {string} questionText - 问题文本
 * @param {boolean} answered - answered 状态
 */
export async function updateQuestionAnsweredStatus(projectId, imageId, questionText, answered) {
  try {
    await db.questions.updateMany({
      where: {
        projectId,
        imageId,
        question: questionText
      },
      data: {
        answered
      }
    });
  } catch (error) {
    console.error('Failed to update question answered status:', error);
    throw error;
  }
}

/**
 * 保存项目的问题列表（支持GA配对）
 * @param {string} projectId - 项目ID
 * @param {Array} questions - 问题列表
 * @param {string} chunkId - 文本块ID
 * @param {string} gaPairId - GA配对ID（可选）
 * @returns {Promise<Array>} - 保存后的问题列表
 */
export async function saveQuestionsWithGaPair(projectId, questions, chunkId, gaPairId = null) {
  try {
    let data = questions.map(item => {
      return {
        projectId,
        chunkId: chunkId ? chunkId : item.chunkId,
        question: item.question,
        label: item.label,
        gaPairId: gaPairId // 添加GA配对ID
      };
    });
    return await db.questions.createMany({ data: data });
  } catch (error) {
    console.error('Failed to create questions with GA pair in database');
    throw error;
  }
}

/**
 * 获取指定文本块的问题
 * @param {string} projectId - 项目ID
 * @param {string} chunkId - 文本块ID
 * @returns {Promise<Array>} - 问题列表
 */
export async function getQuestionsForChunk(projectId, chunkId) {
  return await db.questions.findMany({ where: { projectId, chunkId } });
}

/**
 * 删除单个问题
 * @param {string} questionId - 问题ID
 */
export async function deleteQuestion(questionId) {
  try {
    // console.log(questionId);
    return await db.questions.delete({
      where: {
        id: questionId
      }
    });
  } catch (error) {
    console.error('Failed to delete questions by id in database');
    throw error;
  }
}

/**
 * 批量删除问题
 * @param {Array} questionIds
 */
export async function batchDeleteQuestions(questionIds) {
  try {
    return await db.questions.deleteMany({
      where: {
        id: {
          in: questionIds
        }
      }
    });
  } catch (error) {
    console.error('Failed to delete batch questions in database');
    throw error;
  }
}

export async function getQuestionTemplateById(id) {
  const { templateId } = await db.questions.findUnique({ where: { id } });
  if (templateId) {
    return await db.questionTemplates.findUnique({ where: { id: templateId } });
  }
}
