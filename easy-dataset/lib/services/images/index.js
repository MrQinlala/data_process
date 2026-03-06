/**
 * 图片问题和答案生成服务
 */

import LLMClient from '@/lib/llm/core/index';
import { getImageQuestionPrompt } from '@/lib/llm/prompts/imageQuestion';
import { getImageAnswerPrompt } from '@/lib/llm/prompts/imageAnswer';
import { extractJsonFromLLMOutput, safeParseJSON } from '@/lib/llm/common/util';
import { getImageById, getImageChunk, createImages } from '@/lib/db/images';
import { saveQuestions, updateQuestionAnsweredStatus, getQuestionTemplateById } from '@/lib/db/questions';
import { createImageDataset } from '@/lib/db/imageDatasets';
import { getProjectPath } from '@/lib/db/base';
import { getMimeType } from '@/lib/util/image';
import path from 'path';
import fs from 'fs/promises';
import sizeOf from 'image-size';
import logger from '@/lib/util/logger';

/**
 * 为指定图片生成问题
 * @param {String} projectId 项目ID
 * @param {String} imageId 图片ID
 * @param {Object} options 选项
 * @param {Object} options.model 模型配置
 * @param {String} options.language 语言(zh/en)
 * @param {Number} options.count 问题数量(默认3)
 * @returns {Promise<Object>} 生成结果
 */
export async function generateQuestionsForImage(projectId, imageId, options) {
  try {
    const { model, language = 'zh', count = 3 } = options;

    if (!model) {
      throw new Error('模型配置不能为空');
    }

    // 获取图片信息
    const image = await getImageById(imageId);
    if (!image) {
      throw new Error('图片不存在');
    }

    if (image.projectId !== projectId) {
      throw new Error('图片不属于指定项目');
    }

    // 读取图片文件
    const projectPath = await getProjectPath(projectId);
    const imagePath = path.join(projectPath, 'images', image.imageName);
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(image.imageName);

    // 创建 LLM 客户端
    const llmClient = new LLMClient(model);

    // 生成问题提示词
    const prompt = await getImageQuestionPrompt(language, { number: count }, projectId);

    // 调用视觉模型生成问题
    const { answer } = await llmClient.getVisionResponse(prompt, base64Image, mimeType);

    // 提取问题列表
    const questions = extractJsonFromLLMOutput(answer);

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new Error('生成问题失败或问题列表为空');
    }

    // 获取或创建图片专用的虚拟 chunk
    const imageChunk = await getImageChunk(projectId);

    // 保存问题到数据库
    const savedQuestions = await saveQuestions(
      projectId,
      questions.map(q => ({
        question: q,
        label: 'image',
        imageId: image.id,
        imageName: image.imageName,
        chunkId: imageChunk.id
      }))
    );

    logger.info(`图片 ${image.imageName} 生成了 ${questions.length} 个问题`);

    return {
      imageId: image.id,
      imageName: image.imageName,
      questions: questions,
      total: questions.length
    };
  } catch (error) {
    logger.error(`为图片 ${imageId} 生成问题时出错:`, error);
    throw error;
  }
}

/**
 * 为指定图片生成数据集（问答对）
 * @param {String} projectId 项目ID
 * @param {String} imageId 图片ID
 * @param {String} question 问题文本
 * @param {Object} options 选项
 * @param {Object} options.model 模型配置
 * @returns {Promise<Object>} 生成结果
 */
export async function generateDatasetForImage(projectId, imageId, question, options) {
  try {
    const { model, language = 'zh', previewOnly = false } = options;

    if (!model) {
      throw new Error('模型配置不能为空');
    }

    // 获取图片信息
    const image = await getImageById(imageId);
    if (!image) {
      throw new Error('图片不存在');
    }

    if (image.projectId !== projectId) {
      throw new Error('图片不属于指定项目');
    }

    // 读取图片文件
    const projectPath = await getProjectPath(projectId);
    const imagePath = path.join(projectPath, 'images', image.imageName);
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(image.imageName);

    // 获取问题模版
    const llmClient = new LLMClient(model);
    const { id, question: questionText } = question;
    let questionTemplate = { answerType: 'text' };
    if (id) {
      questionTemplate = (await getQuestionTemplateById(question.id)) || { answerType: 'text' };
    }
    const prompt = await getImageAnswerPrompt(language, { question: questionText, questionTemplate }, projectId);
    let { answer } = await llmClient.getVisionResponse(prompt, base64Image, mimeType);
    if (questionTemplate.answerType !== 'text') {
      const answerJson = safeParseJSON(answer);
      if (typeof answerJson !== 'string') {
        answer = JSON.stringify(answerJson, null, 2);
      }
    }
    // 如果是预览模式，只返回答案，不保存数据集
    if (previewOnly) {
      return {
        imageId: image.id,
        imageName: image.imageName,
        question: questionText,
        answer: answer,
        dataset: null
      };
    }

    // 保存图片数据集
    const dataset = await createImageDataset(projectId, {
      imageId: image.id,
      imageName: image.imageName,
      question: questionText,
      questionId: id,
      answer: answer,
      model: model.modelId || model.modelName,
      answerType: questionTemplate.answerType
    });

    // 更新对应问题的 answered 状态为 true
    await updateQuestionAnsweredStatus(projectId, image.id, questionText, true);

    logger.info(`图片 ${image.imageName} 的问题 "${questionText}" 已生成数据集`);

    return {
      imageId: image.id,
      imageName: image.imageName,
      question: questionText,
      answer: answer,
      dataset: dataset
    };
  } catch (error) {
    logger.error(`为图片 ${imageId} 生成数据集时出错:`, error);
    throw error;
  }
}

/**
 * 导入图片到项目
 * @param {String} projectId 项目ID
 * @param {Array<String>} directories 目录路径数组
 * @returns {Promise<Object>} 导入结果 { success: true, count: number, images: Array }
 */
export async function importImagesFromDirectories(projectId, directories) {
  try {
    if (!directories || !Array.isArray(directories) || directories.length === 0) {
      throw new Error('请选择至少一个目录');
    }

    // 项目图片目录
    const projectPath = await getProjectPath(projectId);
    const projectImagesDir = path.join(projectPath, 'images');
    await fs.mkdir(projectImagesDir, { recursive: true });

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const importedImages = [];

    // 遍历所有选择的目录
    for (const directory of directories) {
      try {
        const files = await fs.readdir(directory);

        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (!imageExtensions.includes(ext)) continue;

          const sourcePath = path.join(directory, file);
          const destPath = path.join(projectImagesDir, file);

          // 复制文件（覆盖同名文件）
          await fs.copyFile(sourcePath, destPath);

          // 获取图片信息
          const stats = await fs.stat(destPath);
          let dimensions = { width: null, height: null };

          try {
            // 读取文件为 Buffer，然后传递给 sizeOf
            const imageBuffer = await fs.readFile(destPath);
            const size = sizeOf(imageBuffer);
            if (size && size.width && size.height) {
              dimensions = { width: size.width, height: size.height };
            }
          } catch (err) {
            console.warn(`无法获取图片尺寸: ${file}`, err.message);
          }

          importedImages.push({
            imageName: file,
            path: `${projectPath}/images/${file}`,
            size: stats.size,
            width: dimensions.width,
            height: dimensions.height
          });
        }
      } catch (err) {
        console.error(`处理目录失败: ${directory}`, err);
      }
    }

    // 批量保存到数据库
    const savedImages = await createImages(projectId, importedImages);

    logger.info(`项目 ${projectId} 成功导入 ${savedImages.length} 张图片`);

    return {
      success: true,
      count: savedImages.length,
      images: savedImages
    };
  } catch (error) {
    logger.error(`导入图片到项目 ${projectId} 时出错:`, error);
    throw error;
  }
}

/**
 * 获取图片详情（包含问题列表和已标注数据）
 * @param {String} projectId 项目ID
 * @param {String} imageId 图片ID
 * @returns {Promise<Object>} 图片详情
 */
export async function getImageDetailWithQuestions(projectId, imageId) {
  try {
    const { db } = await import('@/lib/db/index');

    if (!imageId) {
      throw new Error('缺少图片ID');
    }

    // 获取图片基本信息
    const image = await getImageById(imageId);
    if (!image) {
      throw new Error('图片不存在');
    }

    if (image.projectId !== projectId) {
      throw new Error('图片不属于指定项目');
    }

    // 读取图片文件并转换为base64
    let base64Image = null;
    try {
      const projectPath = await getProjectPath(projectId);
      const imagePath = path.join(projectPath, 'images', image.imageName);
      const imageBuffer = await fs.readFile(imagePath);
      const mimeType = getMimeType(image.imageName);
      base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    } catch (err) {
      console.warn(`Failed to read image: ${image.imageName}`, err);
    }

    // 获取图片的所有问题
    const questions = await db.questions.findMany({
      where: {
        projectId,
        imageId: image.id
      },
      orderBy: {
        createAt: 'desc'
      }
    });

    // 获取所有关联的问题模板
    const templateIds = questions.map(q => q.templateId).filter(Boolean);

    const templates =
      templateIds.length > 0
        ? await db.questionTemplates.findMany({
            where: {
              id: { in: templateIds }
            }
          })
        : [];

    const templateMap = new Map(templates.map(t => [t.id, t]));

    // 获取每个问题的已标注答案
    const questionsWithAnswers = await Promise.all(
      questions.map(async question => {
        // 查找该问题的已标注答案
        const existingAnswer = await db.imageDatasets.findFirst({
          where: {
            imageId: image.id,
            question: question.question
          },
          orderBy: {
            createAt: 'desc'
          }
        });

        // 获取关联的模板
        const template = question.templateId ? templateMap.get(question.templateId) : null;

        return {
          ...question,
          template,
          hasAnswer: !!existingAnswer,
          answer: existingAnswer?.answer || null,
          answerId: existingAnswer?.id || null
        };
      })
    );

    // 分离已标注和未标注的问题
    const answeredQuestions = questionsWithAnswers
      .filter(q => q.hasAnswer)
      .map(q => ({
        id: q.id,
        question: q.question,
        answerType: q.template?.answerType || 'text',
        labels: q.template?.labels || '',
        customFormat: q.template?.customFormat || '',
        description: q.template?.description || '',
        answer: q.answer,
        answerId: q.answerId,
        templateId: q.templateId
      }));

    const unansweredQuestions = questionsWithAnswers
      .filter(q => !q.hasAnswer)
      .map(q => ({
        id: q.id,
        question: q.question,
        answerType: q.template?.answerType || 'text',
        labels: q.template?.labels || '',
        customFormat: q.template?.customFormat || '',
        description: q.template?.description || '',
        templateId: q.templateId
      }));

    return {
      ...image,
      base64: base64Image,
      format: image.imageName.split('.').pop()?.toLowerCase(),
      answeredQuestions,
      unansweredQuestions,
      datasetCount: answeredQuestions.length,
      questionCount: questions.length
    };
  } catch (error) {
    logger.error(`获取图片 ${imageId} 详情时出错:`, error);
    throw error;
  }
}

export default {
  generateQuestionsForImage,
  importImagesFromDirectories,
  generateDatasetForImage,
  getImageDetailWithQuestions
};
