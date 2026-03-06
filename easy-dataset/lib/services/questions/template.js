/**
 * 问题模版服务
 * 处理基于模版为数据源批量生成问题的逻辑
 */

import { PrismaClient } from '@prisma/client';
import { getChunks } from '@/lib/db/chunks';
import { getImages, getImageChunk } from '@/lib/db/images';
import { saveQuestions } from '@/lib/db/questions';

const prisma = new PrismaClient();

/**
 * 根据问题模版为所有相关数据源创建问题
 * @param {String} projectId 项目ID
 * @param {Object} template 问题模版对象
 * @returns {Promise<Object>} 生成结果统计
 */
export async function generateQuestionsFromTemplate(projectId, template) {
  const { sourceType } = template;

  let successCount = 0;
  let failCount = 0;
  const errors = [];

  try {
    if (sourceType === 'text') {
      // 为所有文本块生成问题
      const result = await generateQuestionsForTextChunks(projectId, template);
      successCount += result.successCount;
      failCount += result.failCount;
      errors.push(...result.errors);
    } else if (sourceType === 'image') {
      // 为所有图片生成问题
      const result = await generateQuestionsForImages(projectId, template);
      successCount += result.successCount;
      failCount += result.failCount;
      errors.push(...result.errors);
    }

    return {
      success: true,
      successCount,
      failCount,
      errors,
      message: `成功为 ${successCount} 个数据源创建问题，${failCount} 个失败`
    };
  } catch (error) {
    console.error('生成问题失败:', error);
    return {
      success: false,
      successCount,
      failCount,
      errors: [...errors, error.message],
      message: '生成问题过程中发生错误'
    };
  }
}

/**
 * 为所有文本块生成问题
 * @param {String} projectId 项目ID
 * @param {Object} template 问题模版
 * @param {Boolean} onlyNew 是否只为新的数据源创建（编辑模式）
 * @returns {Promise<Object>} 生成结果
 */
async function generateQuestionsForTextChunks(projectId, template, onlyNew = false) {
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  try {
    // 获取项目下所有文本块
    const chunks = await prisma.chunks.findMany({
      where: { projectId },
      select: {
        id: true
      }
    });

    let targetChunks = chunks;

    // 编辑模式：只为还未创建此模板问题的文本块创建
    if (onlyNew && template.id) {
      targetChunks = [];
      for (const chunk of chunks) {
        const existingQuestion = await prisma.questions.findFirst({
          where: {
            projectId,
            chunkId: chunk.id,
            templateId: template.id
          }
        });
        if (!existingQuestion) {
          targetChunks.push(chunk);
        }
      }
    }

    // 为每个文本块创建问题
    if (targetChunks.length > 0) {
      await saveQuestions(
        projectId,
        targetChunks.map(chunk => ({
          question: template.question,
          chunkId: chunk.id,
          templateId: template.id,
          label: ''
        }))
      );
      successCount = targetChunks.length;
    }

    return { successCount, failCount, errors };
  } catch (error) {
    console.error('获取文本块失败:', error);
    return {
      successCount,
      failCount,
      errors: [...errors, `获取文本块失败: ${error.message}`]
    };
  }
}

/**
 * 为所有图片生成问题
 * @param {String} projectId 项目ID
 * @param {Object} template 问题模版
 * @param {Boolean} onlyNew 是否只为新的数据源创建（编辑模式）
 * @returns {Promise<Object>} 生成结果
 */
async function generateQuestionsForImages(projectId, template, onlyNew = false) {
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  try {
    // 获取项目下所有图片
    const images = await prisma.images.findMany({
      where: { projectId },
      select: {
        id: true,
        imageName: true
      }
    });

    const chunk = await getImageChunk(projectId);

    // 为每个图片创建问题
    for (const image of images) {
      try {
        // 编辑模式：检查是否已经创建过此模板的问题
        if (onlyNew && template.id) {
          const existingQuestion = await prisma.questions.findFirst({
            where: {
              projectId,
              imageId: image.id,
              templateId: template.id
            }
          });
          if (existingQuestion) {
            continue; // 跳过已存在的
          }
        }

        // 创建图片问题，使用imageId而不是chunkId
        await prisma.questions.create({
          data: {
            projectId,
            question: template.question,
            imageId: image.id,
            imageName: image.imageName,
            templateId: template.id,
            label: 'image',
            chunkId: chunk.id
          }
        });
        successCount++;
      } catch (error) {
        console.error(`为图片 ${image.id} 创建问题失败:`, error);
        failCount++;
        errors.push(`图片 ${image.imageName || image.id}: ${error.message}`);
      }
    }

    return { successCount, failCount, errors };
  } catch (error) {
    console.error('获取图片失败:', error);
    return {
      successCount,
      failCount,
      errors: [...errors, `获取图片失败: ${error.message}`]
    };
  }
}

/**
 * 编辑模式：为还未创建此模板问题的数据源生成问题
 * @param {String} projectId 项目ID
 * @param {Object} template 问题模版对象
 * @returns {Promise<Object>} 生成结果统计
 */
export async function generateQuestionsFromTemplateEdit(projectId, template) {
  const { sourceType } = template;

  let successCount = 0;
  let failCount = 0;
  const errors = [];

  try {
    if (sourceType === 'text') {
      const result = await generateQuestionsForTextChunks(projectId, template, true);
      successCount += result.successCount;
      failCount += result.failCount;
      errors.push(...result.errors);
    } else if (sourceType === 'image') {
      const result = await generateQuestionsForImages(projectId, template, true);
      successCount += result.successCount;
      failCount += result.failCount;
      errors.push(...result.errors);
    }

    return {
      success: true,
      successCount,
      failCount,
      errors,
      message: `成功为 ${successCount} 个数据源创建问题，${failCount} 个失败`
    };
  } catch (error) {
    console.error('生成问题失败:', error);
    return {
      success: false,
      successCount,
      failCount,
      errors: [...errors, error.message],
      message: '生成问题过程中发生错误'
    };
  }
}

/**
 * 检查模版是否可以生成问题
 * @param {String} projectId 项目ID
 * @param {String} sourceType 数据源类型
 * @returns {Promise<Object>} 检查结果
 */
export async function checkTemplateGenerationAvailability(projectId, sourceType) {
  try {
    let count = 0;

    if (sourceType === 'text') {
      const chunks = await getChunks(projectId, 1, 1);
      count = chunks.total || 0;
    } else if (sourceType === 'image') {
      const images = await getImages(projectId, 1, 1);
      count = images.total || 0;
    }

    return {
      available: count > 0,
      count,
      message:
        count > 0
          ? `找到 ${count} 个${sourceType === 'text' ? '文本块' : '图片'}，可以生成问题`
          : `项目中没有${sourceType === 'text' ? '文本块' : '图片'}，无法生成问题`
    };
  } catch (error) {
    console.error('检查数据源可用性失败:', error);
    return {
      available: false,
      count: 0,
      message: '检查数据源时发生错误'
    };
  }
}

export default {
  generateQuestionsFromTemplate,
  generateQuestionsFromTemplateEdit,
  checkTemplateGenerationAvailability
};
