import { getActiveModel } from '@/lib/services/models';
import logger from '@/lib/util/logger';
import { getGAGenerationPrompt } from '@/lib/llm/prompts/ga-generation';
import { extractJsonFromLLMOutput } from '@/lib/llm/common/util';
const LLMClient = require('@/lib/llm/core');

/**
 * Generate GA pairs for text content using LLM
 * @param {string} textContent - The text content to analyze
 * @param {string} projectId - The project ID to get the active model for
 * @param {string} language - Language for generation (default: '中文')
 * @returns {Promise<Array>} - Generated GA pairs
 */
export async function generateGaPairs(textContent, projectId, language = '中文') {
  try {
    logger.info('Starting GA pairs generation');

    // 验证输入参数
    if (!textContent || typeof textContent !== 'string') {
      throw new Error('Invalid text content provided');
    }

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Get model configuration
    const model = await getActiveModel(projectId);
    if (!model) {
      throw new Error('No active model available for GA generation');
    }

    logger.info(`Using model: ${model.modelName} for project ${projectId}`);

    const prompt = await getGAGenerationPrompt(language, { text: textContent }, projectId);

    if (!prompt) {
      throw new Error('Failed to generate prompt');
    }

    // Call the LLM API
    const response = await callLLMAPI(model, prompt);

    if (!response) {
      throw new Error('Empty response from LLM');
    }

    // Parse the response
    const gaPairs = parseGaResponse(response);

    logger.info(`Successfully generated ${gaPairs.length} GA pairs`);
    return gaPairs;
  } catch (error) {
    logger.error('Failed to generate GA pairs:', error);
    throw error;
  }
}

/**
 * Call LLM API with the given model and prompt
 * @param {Object} model - Model configuration
 * @param {string} prompt - The prompt to send
 * @returns {Promise<Object|Array>} - Parsed JSON object/array
 */
async function callLLMAPI(model, prompt) {
  try {
    if (!model || !prompt) {
      throw new Error('Model and prompt are required');
    }

    logger.info('Calling LLM API...');

    const llmClient = new LLMClient(model);
    const response = await llmClient.getResponse(prompt); // Changed from llmClient.chat

    if (!response) {
      throw new Error('Invalid response from LLM');
    }

    return response;
  } catch (error) {
    logger.error('LLM API call failed:', error);
    throw new Error(`LLM API call failed: ${error.message}`);
  }
}

/**
 * Parse GA pairs from LLM response
 * @param {string} response - Raw LLM response
 * @returns {Array} - Parsed GA pairs
 */
function parseGaResponse(response) {
  try {
    // Log the raw response for debugging
    logger.info('Raw LLM response length:', response.length);

    const parsed = extractJsonFromLLMOutput(response);

    if (!parsed) {
      throw new Error('Failed to extract JSON from LLM response');
    }

    // Handle case where response is wrapped in an object
    let gaPairsArray = parsed;
    if (!Array.isArray(parsed)) {
      // Check if it's wrapped in a property
      if (parsed.gaPairs && Array.isArray(parsed.gaPairs)) {
        gaPairsArray = parsed.gaPairs;
      } else if (parsed.pairs && Array.isArray(parsed.pairs)) {
        gaPairsArray = parsed.pairs;
      } else if (parsed.results && Array.isArray(parsed.results)) {
        gaPairsArray = parsed.results;
      } else {
        // Try to convert object format to array format
        const objectKeys = Object.keys(parsed);
        const audienceKeys = objectKeys.filter(key => key.startsWith('audience_'));
        const genreKeys = objectKeys.filter(key => key.startsWith('genre_'));

        if (audienceKeys.length > 0 && genreKeys.length > 0) {
          gaPairsArray = [];
          for (let i = 1; i <= Math.min(audienceKeys.length, genreKeys.length); i++) {
            const audience = parsed[`audience_${i}`];
            const genre = parsed[`genre_${i}`];
            if (audience && genre) {
              gaPairsArray.push({ audience, genre });
            }
          }
        } else {
          throw new Error('Response is not an array and no recognized array property found');
        }
      }
    }

    // Validate the structure
    const validatedPairs = gaPairsArray.map((pair, index) => {
      if (!pair.genre || !pair.audience) {
        throw new Error(`GA pair ${index + 1} missing genre or audience`);
      }

      if (!pair.genre.title || !pair.genre.description || !pair.audience.title || !pair.audience.description) {
        throw new Error(`GA pair ${index + 1} missing required fields`);
      }

      return {
        genre: {
          title: String(pair.genre.title).trim(),
          description: String(pair.genre.description).trim()
        },
        audience: {
          title: String(pair.audience.title).trim(),
          description: String(pair.audience.description).trim()
        }
      };
    });

    // Ensure we have exactly 5 pairs
    if (validatedPairs.length !== 5) {
      logger.warn(`Expected 5 GA pairs, got ${validatedPairs.length}. Using first 5 or padding with fallbacks.`);

      // If we have more than 5, take the first 5
      if (validatedPairs.length > 5) {
        return validatedPairs.slice(0, 5);
      }

      // If we have fewer than 5, pad with fallbacks
      const fallbacks = getFallbackGaPairs();
      while (validatedPairs.length < 5) {
        validatedPairs.push(fallbacks[validatedPairs.length]);
      }
    }

    logger.info(`Successfully parsed ${validatedPairs.length} GA pairs`);
    return validatedPairs;
  } catch (error) {
    logger.error('Failed to parse GA response:', error);
    logger.error('Raw response:', response);

    // Return fallback GA pairs if parsing fails
    logger.info('Using fallback GA pairs due to parsing failure');
    return getFallbackGaPairs();
  }
}

/**
 * Get fallback GA pairs when generation fails
 * @returns {Array} - Default GA pairs
 */
function getFallbackGaPairs() {
  return [
    {
      genre: {
        title: '学术研究',
        description: '学术性、研究导向的内容，具有正式的语调和详细的分析'
      },
      audience: {
        title: '研究人员',
        description: '寻求深入知识的学术研究人员和研究生'
      }
    },
    {
      genre: {
        title: '教育指南',
        description: '结构化的学习材料，具有清晰的解释和示例'
      },
      audience: {
        title: '学生',
        description: '本科生和该主题的新学习者'
      }
    },
    {
      genre: {
        title: '专业手册',
        description: '实用、以实施为重点的内容，用于工作场所应用'
      },
      audience: {
        title: '从业者',
        description: '在实践中应用知识的行业专业人员'
      }
    },
    {
      genre: {
        title: '科普文章',
        description: '使复杂主题易于理解的可访问内容'
      },
      audience: {
        title: '普通公众',
        description: '没有专业背景的好奇读者'
      }
    },
    {
      genre: {
        title: '技术文档',
        description: '详细的规范和实施指南'
      },
      audience: {
        title: '开发人员',
        description: '技术专家和系统实施人员'
      }
    }
  ];
}
