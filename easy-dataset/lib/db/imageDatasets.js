'use server';
import { db } from '@/lib/db/index';

/**
 * 创建图像数据集
 */
export async function createImageDataset(projectId, datasetData) {
  try {
    return await db.imageDatasets.create({
      data: {
        projectId,
        ...datasetData
      }
    });
  } catch (error) {
    console.error('Failed to create image dataset:', error);
    throw error;
  }
}

/**
 * 获取图片的数据集列表
 */
export async function getImageDatasets(imageId, page = 1, pageSize = 10) {
  try {
    const [data, total] = await Promise.all([
      db.imageDatasets.findMany({
        where: { imageId },
        orderBy: {
          createAt: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      db.imageDatasets.count({
        where: { imageId }
      })
    ]);

    return { data, total };
  } catch (error) {
    console.error('Failed to get image datasets:', error);
    throw error;
  }
}

/**
 * 更新图像数据集
 */
export async function updateImageDataset(datasetId, updateData) {
  try {
    return await db.imageDatasets.update({
      where: { id: datasetId },
      data: updateData
    });
  } catch (error) {
    console.error('Failed to update image dataset:', error);
    throw error;
  }
}

/**
 * 删除图像数据集
 */
export async function deleteImageDataset(datasetId) {
  try {
    return await db.imageDatasets.delete({
      where: { id: datasetId }
    });
  } catch (error) {
    console.error('Failed to delete image dataset:', error);
    throw error;
  }
}

/**
 * 根据项目ID获取所有图像数据集（支持筛选）
 */
export async function getImageDatasetsByProject(projectId, page = 1, pageSize = 10, filters = {}) {
  try {
    // 构建查询条件
    const whereClause = { projectId };

    // 搜索条件（问题或答案）
    if (filters.search) {
      whereClause.OR = [{ question: { contains: filters.search } }, { answer: { contains: filters.search } }];
    }

    // 确认状态筛选
    if (filters.confirmed !== undefined) {
      whereClause.confirmed = filters.confirmed;
    }

    // 评分筛选
    if (filters.minScore !== undefined || filters.maxScore !== undefined) {
      whereClause.score = {};
      if (filters.minScore !== undefined) {
        whereClause.score.gte = filters.minScore;
      }
      if (filters.maxScore !== undefined) {
        whereClause.score.lte = filters.maxScore;
      }
    }

    const [data, total] = await Promise.all([
      db.imageDatasets.findMany({
        where: whereClause,
        orderBy: {
          createAt: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      db.imageDatasets.count({
        where: whereClause
      })
    ]);

    return { data, total };
  } catch (error) {
    console.error('Failed to get image datasets by project:', error);
    throw error;
  }
}

/**
 * 根据ID获取单个图像数据集
 */
export async function getImageDatasetById(datasetId) {
  try {
    const dataset = await db.imageDatasets.findUnique({
      where: { id: datasetId },
      include: {
        image: true // 包含关联的图片信息
      }
    });

    if (!dataset) {
      return null;
    }

    // 如果有 questionId，获取问题模版信息
    if (dataset.questionId) {
      const questionData = await db.questions.findUnique({
        where: { id: dataset.questionId }
      });
      let questionTemplate = null;
      if (questionData) {
        dataset.questionData = questionData;
        if (questionData.templateId) {
          questionTemplate = await db.questionTemplates.findUnique({
            where: { id: questionData.templateId }
          });
        }
      } else {
        dataset.questionData = { id: 'x', question: dataset.question };
      }

      if (questionTemplate) {
        // 解析标签
        let availableLabels = [];
        if (questionTemplate.labels) {
          try {
            availableLabels = JSON.parse(questionTemplate.labels);
          } catch (e) {
            console.error('Failed to parse labels:', e);
          }
        }

        // 添加问题模版信息
        return {
          ...dataset,
          availableLabels,
          customFormat: questionTemplate.customFormat || '',
          questionTemplate,
          questionData
        };
      }
    }

    return dataset;
  } catch (error) {
    console.error('Failed to get image dataset by id:', error);
    throw error;
  }
}

/**
 * 根据项目ID获取所有图像数据集的标签
 */
export async function getImageDatasetsTagsByProject(projectId) {
  try {
    const datasets = await db.imageDatasets.findMany({
      where: { projectId, tags: { not: '' } },
      select: { tags: true }
    });

    return datasets;
  } catch (error) {
    console.error('Failed to get image datasets tags by project:', error);
    throw error;
  }
}

/**
 * 获取用于导出的图像数据集
 */
export async function getImageDatasetsForExport(projectId, confirmedOnly = false) {
  try {
    const whereClause = { projectId };

    // 如果只导出已确认的
    if (confirmedOnly) {
      whereClause.confirmed = true;
    }

    const datasets = await db.imageDatasets.findMany({
      where: whereClause
    });

    return datasets;
  } catch (error) {
    console.error('Failed to get image datasets for export:', error);
    throw error;
  }
}
