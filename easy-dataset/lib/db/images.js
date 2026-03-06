'use server';
import { db } from '@/lib/db/index';
import { getProjectPath } from '@/lib/db/base';
import { getMimeType } from '@/lib/util/image';

/**
 * 获取项目的图片列表（分页）
 */
export async function getImages(projectId, page = 1, pageSize = 20, imageName = '', hasQuestions, hasDatasets, simple) {
  try {
    // 构建基础查询条件
    const baseWhereClause = {
      projectId,
      ...(imageName && { imageName: { contains: imageName } })
    };

    // 如果有过滤条件，需要使用复杂查询
    if (hasQuestions !== undefined || hasDatasets !== undefined) {
      // 先获取所有符合基础条件的图片ID和统计信息
      const allImages = await db.images.findMany({
        where: baseWhereClause,
        orderBy: {
          createAt: 'desc'
        }
      });

      if (simple) {
        return { data: allImages };
      }

      // 获取每个图片的统计信息并应用过滤
      const imagesWithStats = await Promise.all(
        allImages.map(async image => {
          const [questionCount, datasetCount] = await Promise.all([
            db.questions.count({
              where: {
                projectId,
                imageId: image.id
              }
            }),
            db.imageDatasets.count({
              where: {
                imageId: image.id
              }
            })
          ]);

          return {
            ...image,
            questionCount,
            datasetCount
          };
        })
      );

      // 应用筛选条件
      let filteredImages = imagesWithStats;
      if (hasQuestions === 'true') {
        filteredImages = filteredImages.filter(img => img.questionCount > 0);
      } else if (hasQuestions === 'false') {
        filteredImages = filteredImages.filter(img => img.questionCount === 0);
      }

      if (hasDatasets === 'true') {
        filteredImages = filteredImages.filter(img => img.datasetCount > 0);
      } else if (hasDatasets === 'false') {
        filteredImages = filteredImages.filter(img => img.datasetCount === 0);
      }

      // 应用分页
      const total = filteredImages.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedImages = filteredImages.slice(startIndex, endIndex);

      // 为分页后的图片添加 base64 数据
      const imagesWithBase64 = await Promise.all(
        paginatedImages.map(async image => {
          let base64Image = null;
          try {
            const fs = require('fs/promises');
            const path = require('path');
            const projectPath = await getProjectPath(projectId);
            const imagePath = path.join(projectPath, 'images', image.imageName);
            const imageBuffer = await fs.readFile(imagePath);
            const ext = path.extname(image.imageName).toLowerCase();
            const mimeTypes = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.gif': 'image/gif',
              '.bmp': 'image/bmp',
              '.webp': 'image/webp',
              '.svg': 'image/svg+xml'
            };
            const mimeType = mimeTypes[ext] || 'image/jpeg';
            base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
          } catch (err) {
            console.warn(`Failed to read image: ${image.imageName}`, err);
          }

          return {
            ...image,
            base64: base64Image
          };
        })
      );

      return {
        data: imagesWithBase64,
        total,
        page,
        pageSize
      };
    } else {
      // 没有过滤条件时，使用原来的简单查询
      const [data, total] = await Promise.all([
        db.images.findMany({
          where: baseWhereClause,
          orderBy: {
            createAt: 'desc'
          },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        db.images.count({
          where: baseWhereClause
        })
      ]);

      // 获取每个图片的问题和数据集数量，并读取图片为 base64
      const imagesWithStats = await Promise.all(
        data.map(async image => {
          const [questionCount, datasetCount] = await Promise.all([
            db.questions.count({
              where: {
                projectId,
                imageId: image.id
              }
            }),
            db.imageDatasets.count({
              where: {
                imageId: image.id
              }
            })
          ]);

          // 读取图片文件并转换为 base64
          let base64Image = null;
          try {
            const fs = require('fs/promises');
            const path = require('path');
            const projectPath = await getProjectPath(projectId);
            const imagePath = path.join(projectPath, 'images', image.imageName);
            const imageBuffer = await fs.readFile(imagePath);
            const mimeType = getMimeType(image.imageName);
            base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
          } catch (err) {
            console.warn(`Failed to read image: ${image.imageName}`, err);
          }

          return {
            ...image,
            questionCount,
            datasetCount,
            base64: base64Image
          };
        })
      );

      return {
        data: imagesWithStats,
        total,
        page,
        pageSize
      };
    }
  } catch (error) {
    console.error('Failed to get images:', error);
    throw error;
  }
}

/**
 * 创建图片记录
 */
export async function createImage(projectId, imageData) {
  try {
    return await db.images.create({
      data: {
        projectId,
        ...imageData
      }
    });
  } catch (error) {
    console.error('Failed to create image:', error);
    throw error;
  }
}

/**
 * 批量创建图片记录
 */
export async function createImages(projectId, imagesData) {
  try {
    const results = [];
    for (const imageData of imagesData) {
      // 检查是否已存在
      const existing = await db.images.findFirst({
        where: {
          projectId,
          imageName: imageData.imageName
        }
      });

      if (existing) {
        // 更新现有记录
        const updated = await db.images.update({
          where: { id: existing.id },
          data: imageData
        });
        results.push(updated);
      } else {
        // 创建新记录
        const created = await db.images.create({
          data: {
            projectId,
            ...imageData
          }
        });
        results.push(created);
      }
    }
    return results;
  } catch (error) {
    console.error('Failed to create images:', error);
    throw error;
  }
}

/**
 * 根据图片 ID 获取图片
 */
export async function getImageById(imageId) {
  try {
    return await db.images.findUnique({
      where: { id: imageId }
    });
  } catch (error) {
    console.error('Failed to get image by id:', error);
    throw error;
  }
}

/**
 * 根据图片名称获取图片
 */
export async function getImageByName(projectId, imageName) {
  try {
    return await db.images.findFirst({
      where: {
        projectId,
        imageName
      }
    });
  } catch (error) {
    console.error('Failed to get image by name:', error);
    throw error;
  }
}

/**
 * 删除图片
 */
export async function deleteImage(imageId) {
  try {
    return await db.images.delete({
      where: { id: imageId }
    });
  } catch (error) {
    console.error('Failed to delete image:', error);
    throw error;
  }
}

/**
 * 获取图片详情（包含统计信息）
 */
export async function getImageDetail(imageId) {
  try {
    const image = await db.images.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return null;
    }

    const [questionCount, datasetCount] = await Promise.all([
      db.questions.count({
        where: {
          projectId: image.projectId,
          imageId: image.id
        }
      }),
      db.imageDatasets.count({
        where: {
          imageId: image.id
        }
      })
    ]);

    return {
      ...image,
      questionCount,
      datasetCount
    };
  } catch (error) {
    console.error('Failed to get image detail:', error);
    throw error;
  }
}

export async function getImageChunk(projectId) {
  let imageChunk = await db.chunks.findFirst({
    where: {
      projectId,
      name: 'Image Chunk'
    }
  });

  if (!imageChunk) {
    imageChunk = await db.chunks.create({
      data: {
        name: 'Image Chunk',
        projectId,
        fileId: 'image',
        fileName: 'image.md',
        content: '',
        summary: '',
        size: 0
      }
    });
  }

  return imageChunk;
}
