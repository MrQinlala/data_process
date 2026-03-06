import { getModelConfigById } from '@/lib/db/model-config';
import { getProject } from '@/lib/db/projects';
import logger from '@/lib/util/logger';

/**
 * Get the active model configuration for a project
 * @param {string} projectId - Optional project ID to get the default model for
 * @returns {Promise<Object|null>} - Active model configuration or null
 */
export async function getActiveModel(projectId = null) {
  try {
    // If projectId is provided, get the default model for that project
    if (projectId) {
      const project = await getProject(projectId);
      if (project && project.defaultModelConfigId) {
        const modelConfig = await getModelConfigById(project.defaultModelConfigId);
        if (modelConfig) {
          logger.info(`Using default model for project ${projectId}: ${modelConfig.modelName}`);
          return modelConfig;
        }
      }
    }

    // If no specific project model found, try to get from localStorage context
    // This is a fallback for when the function is called without context
    logger.warn('No active model found');
    return null;
  } catch (error) {
    logger.error('Failed to get active model:', error);
    return null;
  }
}

/**
 * Get active model by ID
 * @param {string} modelConfigId - Model configuration ID
 * @returns {Promise<Object|null>} - Model configuration or null
 */
export async function getModelById(modelConfigId) {
  try {
    if (!modelConfigId) {
      logger.warn('No model ID provided');
      return null;
    }

    const modelConfig = await getModelConfigById(modelConfigId);
    if (modelConfig) {
      logger.info(`Retrieved model: ${modelConfig.modelName}`);
      return modelConfig;
    }

    logger.warn(`Model not found with ID: ${modelConfigId}`);
    return null;
  } catch (error) {
    logger.error('Failed to get model by ID:', error);
    return null;
  }
}
