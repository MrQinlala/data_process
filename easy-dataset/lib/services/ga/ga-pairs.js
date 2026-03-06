import { generateGaPairs } from './ga-generation';
import { getModelById } from '../models';
import { saveGaPairs, getGaPairsByFileId } from '@/lib/db/ga-pairs';
import { getProjectFileContentById } from '@/lib/db/files';
import logger from '@/lib/util/logger';

/**
 * Batch generate GA pairs for multiple files
 * @param {string} projectId - Project ID
 * @param {Array} files - Array of file objects
 * @param {string} modelConfigId - Model configuration ID
 * @param {string} language - Language for generation (default: '中文')
 * @param {boolean} appendMode - Whether to append to existing GA pairs (default: false)
 * @returns {Promise<Array>} - Array of generation results
 */
export async function batchGenerateGaPairs(projectId, files, modelConfigId, language = '中文', appendMode = false) {
  try {
    logger.info(`Starting batch GA pairs generation for ${files.length} files`);

    // Get model configuration
    const modelConfig = await getModelById(modelConfigId);
    if (!modelConfig) {
      throw new Error('Model configuration not found');
    }

    const results = [];

    // Process each file
    for (const file of files) {
      try {
        logger.info(`Processing file: ${file.fileName}`);

        // Check if GA pairs already exist for this file
        const existingPairs = await getGaPairsByFileId(file.id);

        // 在非追加模式下，如果已存在GA对则跳过
        if (!appendMode && existingPairs && existingPairs.length > 0) {
          logger.info(`GA pairs already exist for file ${file.fileName}, skipping`);
          results.push({
            fileId: file.id,
            fileName: file.fileName,
            success: true,
            skipped: true,
            message: 'GA pairs already exist',
            gaPairs: existingPairs
          });
          continue;
        }
        // Get file content
        const fileContent = await getProjectFileContentById(projectId, file.id);
        if (!fileContent) {
          throw new Error('File content not found');
        }
        // Limit content length for processing (max 50,000 characters)
        const maxLength = 50000;
        const content = fileContent.length > maxLength ? fileContent.substring(0, maxLength) + '...' : fileContent;

        // Generate GA pairs
        const gaPairs = await generateGaPairs(content, projectId, language);

        // Save GA pairs to database
        const savedPairs = await saveGaPairsForFile(projectId, file.id, gaPairs, appendMode, existingPairs);

        results.push({
          fileId: file.id,
          fileName: file.fileName,
          success: true,
          skipped: false,
          message: `Generated ${gaPairs.length} GA pairs`,
          gaPairs: savedPairs
        });

        logger.info(`Successfully generated GA pairs for file: ${file.fileName}`);
      } catch (error) {
        logger.error(`Failed to generate GA pairs for file ${file.fileName}:`, error);
        results.push({
          fileId: file.id,
          fileName: file.fileName,
          success: false,
          skipped: false,
          error: error.message,
          message: `Failed: ${error.message}`
        });
      }
    }

    logger.info(
      `Batch GA pairs generation completed. Success: ${results.filter(r => r.success).length}, Failed: ${results.filter(r => !r.success).length}`
    );
    return results;
  } catch (error) {
    logger.error('Batch GA pairs generation failed:', error);
    throw error;
  }
}

/**
 * Save GA pairs for a file
 * @param {string} projectId - Project ID
 * @param {string} fileId - File ID
 * @param {Array} gaPairs - Generated GA pairs
 * @param {boolean} appendMode - Whether to append to existing GA pairs
 * @param {Array} existingPairs - Existing GA pairs (for append mode)
 * @returns {Promise<Array>} - Saved GA pairs
 */
async function saveGaPairsForFile(projectId, fileId, gaPairs, appendMode = false, existingPairs = []) {
  try {
    if (appendMode && existingPairs.length > 0) {
      // 追加模式：使用与单文件生成相同的逻辑
      const { createGaPairs } = await import('@/lib/db/ga-pairs');

      const startPairNumber = existingPairs.length + 1;
      const newGaPairData = gaPairs.map((pair, index) => ({
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

      // 返回所有GA对（现有的+新增的）
      const allPairs = await getGaPairsByFileId(fileId);
      return allPairs;
    } else {
      // Use the database function to save GA pairs
      const result = await saveGaPairs(projectId, fileId, gaPairs);

      // Get the saved pairs to return
      const savedPairs = await getGaPairsByFileId(fileId);
      return savedPairs;
    }
  } catch (error) {
    logger.error('Failed to save GA pairs:', error);
    throw error;
  }
}
