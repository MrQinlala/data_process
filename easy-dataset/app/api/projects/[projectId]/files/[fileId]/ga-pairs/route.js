import { NextResponse } from 'next/server';
import { getGaPairsByFileId, toggleGaPairActive, saveGaPairs, createGaPairs } from '@/lib/db/ga-pairs';
import { getUploadFileInfoById } from '@/lib/db/upload-files';
import { generateGaPairs } from '@/lib/services/ga/ga-generation';
import logger from '@/lib/util/logger';
import { db } from '@/lib/db/index';

/**
 * 生成文件的 GA 对
 */
export async function POST(request, { params }) {
  try {
    const { projectId, fileId } = params;
    const { regenerate = false, appendMode = false, language = '中文' } = await request.json();

    // 验证参数
    if (!projectId || !fileId) {
      return NextResponse.json({ error: 'Project ID and File ID are required' }, { status: 400 });
    }

    logger.info(`Starting GA pairs generation for project: ${projectId}, file: ${fileId}, appendMode: ${appendMode}`);

    // 检查文件是否存在
    const file = await getUploadFileInfoById(fileId);
    if (!file || file.projectId !== projectId) {
      return NextResponse.json({ error: 'File not found or does not belong to the project' }, { status: 404 });
    }

    // 获取现有的GA对
    const existingGaPairs = await getGaPairsByFileId(fileId);

    // 如果是追加模式且已有GA对，或者不是重新生成且已存在GA对
    if (!regenerate && !appendMode && existingGaPairs.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'GA pairs already exist for this file',
        data: existingGaPairs
      });
    }

    // 读取文件内容
    const fileContent = await getFileContent(projectId, file.fileName);
    if (!fileContent) {
      return NextResponse.json({ error: 'Failed to read file content' }, { status: 500 });
    }

    logger.info(`File content loaded successfully, length: ${fileContent.length}`);

    // 检查模型配置
    try {
      const { getActiveModel } = await import('@/lib/services/models');
      const activeModel = await getActiveModel(projectId);

      if (!activeModel) {
        logger.error('No active model configuration found');
        return NextResponse.json(
          { error: 'No active AI model configured. Please configure a model in settings first.' },
          { status: 400 }
        );
      }

      logger.info(`Using active model: ${activeModel.provider} - ${activeModel.model}`);
    } catch (modelError) {
      logger.error('Error checking model configuration:', modelError);
      return NextResponse.json(
        { error: 'Failed to load model configuration. Please check your AI model settings.' },
        { status: 500 }
      );
    }

    // 调用 LLM 生成 GA 对
    logger.info(`Generating GA pairs for file: ${file.fileName}`);
    let generatedGaPairs;

    try {
      generatedGaPairs = await generateGaPairs(fileContent, projectId, language);

      if (!generatedGaPairs || generatedGaPairs.length === 0) {
        logger.warn('No GA pairs generated from LLM');
        return NextResponse.json(
          {
            error:
              'No GA pairs could be generated from the file content. The content might be too short or not suitable for GA pair generation.'
          },
          { status: 400 }
        );
      }

      logger.info(`Successfully generated ${generatedGaPairs.length} GA pairs from LLM`);
    } catch (generationError) {
      logger.error('GA pairs generation failed:', generationError);

      // 现有的错误处理逻辑...
      let errorMessage = 'Failed to generate GA pairs';
      if (generationError.message.includes('No active model')) {
        errorMessage = 'No active AI model available. Please configure and activate a model in settings.';
      } else if (generationError.message.includes('API key')) {
        errorMessage = 'Invalid API key or model configuration. Please check your AI model settings.';
      } else if (generationError.message.includes('rate limit')) {
        errorMessage = 'API rate limit exceeded. Please try again later.';
      } else {
        errorMessage = `AI model error: ${generationError.message}`;
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // 保存到数据库
    try {
      if (appendMode && existingGaPairs.length > 0) {
        // 追加模式：只保存新生成的GA对，不删除现有的
        logger.info(`Appending ${generatedGaPairs.length} new GA pairs to existing ${existingGaPairs.length} pairs`);

        // 为新GA对设置正确的pairNumber
        const startPairNumber = existingGaPairs.length + 1;
        const newGaPairData = generatedGaPairs.map((pair, index) => ({
          projectId,
          fileId,
          pairNumber: startPairNumber + index,
          genreTitle: pair.genre?.title || pair.genreTitle || '',
          genreDesc: pair.genre?.description || pair.genreDesc || '',
          audienceTitle: pair.audience?.title || pair.audienceTitle || '',
          audienceDesc: pair.audience?.description || pair.audienceDesc || '',
          isActive: true
        }));

        // 只创建新的GA对，不删除现有的
        await createGaPairs(newGaPairData);
        logger.info('New GA pairs appended to database successfully');
      } else {
        // 覆盖模式：删除现有的，保存新的
        await saveGaPairs(projectId, fileId, generatedGaPairs);
        logger.info('GA pairs saved to database successfully');
      }
    } catch (saveError) {
      logger.error('Failed to save GA pairs to database:', saveError);
      return NextResponse.json(
        { error: 'Generated GA pairs successfully but failed to save to database' },
        { status: 500 }
      );
    }

    // 获取保存后的所有GA对
    const allGaPairs = await getGaPairsByFileId(fileId);

    if (appendMode && existingGaPairs.length > 0) {
      // 追加模式：只返回新生成的GA对
      const newGaPairs = allGaPairs.slice(existingGaPairs.length);
      logger.info(`Successfully appended ${newGaPairs.length} GA pairs. Total pairs: ${allGaPairs.length}`);

      return NextResponse.json({
        success: true,
        message: `${newGaPairs.length} new GA pairs appended successfully`,
        data: newGaPairs,
        total: allGaPairs.length
      });
    } else {
      // 覆盖模式：返回所有GA对
      logger.info(`Successfully generated and saved ${allGaPairs.length} GA pairs for file: ${file.fileName}`);

      return NextResponse.json({
        success: true,
        message: 'GA pairs generated successfully',
        data: allGaPairs
      });
    }
  } catch (error) {
    logger.error('Unexpected error in GA pairs generation:', error);
    return NextResponse.json(
      { error: error.message || 'Unexpected error occurred during GA pairs generation' },
      { status: 500 }
    );
  }
}

/**
 * 获取文件的 GA 对
 */
export async function GET(request, { params }) {
  try {
    const { projectId, fileId } = params;

    if (!projectId || !fileId) {
      return NextResponse.json({ error: 'Project ID and File ID are required' }, { status: 400 });
    }

    const gaPairs = await getGaPairsByFileId(fileId);

    return NextResponse.json({
      success: true,
      data: gaPairs
    });
  } catch (error) {
    console.error('Error getting GA pairs:', String(error));
    return NextResponse.json({ error: 'Failed to get GA pairs' }, { status: 500 });
  }
}

/**
 * 更新/替换文件的所有 GA 对
 */
export async function PUT(request, { params }) {
  try {
    const { projectId, fileId } = params;
    const body = await request.json();

    if (!projectId || !fileId) {
      return NextResponse.json({ error: 'Project ID and File ID are required' }, { status: 400 });
    }

    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Updates array is required' }, { status: 400 });
    }

    logger.info(`Replacing all GA pairs for file ${fileId} with ${updates.length} pairs`);

    // 使用数据库事务确保原子性操作
    const results = await db.$transaction(async tx => {
      // 1. 先删除所有现有的GA对
      await tx.gaPairs.deleteMany({
        where: { fileId }
      });

      // 2. 然后创建新的GA对
      if (updates.length > 0) {
        const gaPairData = updates.map((pair, index) => ({
          projectId,
          fileId,
          pairNumber: index + 1,
          genreTitle: pair.genreTitle || pair.genre?.title || pair.genre || '',
          genreDesc: pair.genreDesc || pair.genre?.description || '',
          audienceTitle: pair.audienceTitle || pair.audience?.title || pair.audience || '',
          audienceDesc: pair.audienceDesc || pair.audience?.description || '',
          isActive: pair.isActive !== undefined ? pair.isActive : true
        }));

        // 验证数据
        for (const data of gaPairData) {
          if (!data.genreTitle || !data.audienceTitle) {
            throw new Error(`Invalid GA pair data: missing genre or audience title`);
          }
        }

        await tx.gaPairs.createMany({ data: gaPairData });
      }

      // 3. 返回新创建的GA对
      return await tx.gaPairs.findMany({
        where: { fileId },
        orderBy: { pairNumber: 'asc' }
      });
    });

    logger.info(`Successfully replaced GA pairs, new count: ${results.length}`);

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Error updating GA pairs:', error);
    return NextResponse.json({ error: error.message || 'Failed to update GA pairs' }, { status: 500 });
  }
}

/**
 * 切换 GA 对激活状态
 */
export async function PATCH(request, { params }) {
  try {
    const { projectId, fileId } = params;
    const body = await request.json();

    if (!projectId || !fileId) {
      return NextResponse.json({ error: 'Project ID and File ID are required' }, { status: 400 });
    }

    const { gaPairId, isActive } = body;

    if (!gaPairId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'GA pair ID and active status are required' }, { status: 400 });
    }

    const updatedPair = await toggleGaPairActive(gaPairId, isActive);

    return NextResponse.json({
      success: true,
      data: updatedPair
    });
  } catch (error) {
    console.error('Error toggling GA pair active status:', String(error));
    return NextResponse.json({ error: 'Failed to toggle GA pair active status' }, { status: 500 });
  }
}

// Helper function to read file content
async function getFileContent(projectId, fileName) {
  try {
    const { getProjectRoot } = await import('@/lib/db/base');
    const path = await import('path');
    const fs = await import('fs');

    const projectRoot = await getProjectRoot();
    const filePath = path.join(projectRoot, projectId, 'files', fileName.replace('.pdf', '.md'));

    return await fs.promises.readFile(filePath, 'utf8');
  } catch (error) {
    logger.error('Failed to read file content:', error);
    return null;
  }
}
