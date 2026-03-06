/**
 * 数据蒸馏任务处理器
 * 负责异步处理全自动蒸馏任务
 */

import { PrismaClient } from '@prisma/client';
import { updateTask } from './index';
import { getTaskConfig } from '@/lib/db/projects';
import axios from 'axios';

const prisma = new PrismaClient();

/**
 * 处理数据蒸馏任务
 * @param {Object} task 任务对象
 * @returns {Promise<void>}
 */
export async function processDataDistillationTask(task) {
  try {
    console.log(`Starting data distillation task: ${task.id}`);

    // 解析任务配置
    let taskNote;
    try {
      taskNote = JSON.parse(task.note);
    } catch (error) {
      throw new Error(`Failed to parse task config: ${error.message}`);
    }

    // 解析模型信息
    let modelInfo;
    try {
      modelInfo = JSON.parse(task.modelInfo);
    } catch (error) {
      throw new Error(`Failed to parse model info: ${error.message}`);
    }

    const {
      topic,
      levels,
      tagsPerLevel,
      questionsPerTag,
      datasetType = 'single-turn',
      estimatedTags,
      estimatedQuestions
    } = taskNote;

    const projectId = task.projectId;
    const language = task.language || 'zh';

    // 获取项目配置
    const taskConfig = await getTaskConfig(projectId);
    const concurrencyLimit = taskConfig?.concurrencyLimit || 5;

    // 初始化进度统计
    let progress = {
      stage: 'initializing',
      tagsTotal: estimatedTags || 0,
      tagsBuilt: 0,
      questionsTotal: estimatedQuestions || 0,
      questionsBuilt: 0,
      datasetsTotal: estimatedQuestions || 0,
      datasetsBuilt: 0,
      multiTurnDatasetsTotal: datasetType === 'multi-turn' || datasetType === 'both' ? estimatedQuestions : 0,
      multiTurnDatasetsBuilt: 0
    };

    // 更新任务初始状态
    await updateTask(task.id, {
      totalCount: estimatedQuestions,
      detail: `Starting tag tree build. Levels: ${levels}, tags per level: ${tagsPerLevel}, questions per tag: ${questionsPerTag}`
    });
    console.log(
      `[Data distillation task ${task.id}] Starting tag tree build. Levels: ${levels}, tags/level: ${tagsPerLevel}, questions/tag: ${questionsPerTag}`
    );

    // 阶段1: 构建标签树
    await buildTagTree({
      taskId: task.id,
      projectId,
      topic,
      levels,
      tagsPerLevel,
      model: modelInfo,
      language,
      progress,
      concurrencyLimit
    });

    // 阶段2: 生成问题
    await generateQuestionsForTags({
      taskId: task.id,
      projectId,
      levels,
      questionsPerTag,
      model: modelInfo,
      language,
      progress,
      concurrencyLimit
    });

    // 阶段3: 生成数据集
    if (datasetType === 'single-turn' || datasetType === 'both') {
      await generateDatasetsForQuestions({
        taskId: task.id,
        projectId,
        model: modelInfo,
        language,
        progress,
        concurrencyLimit
      });
    }

    // 阶段4: 生成多轮对话数据集
    if (datasetType === 'multi-turn' || datasetType === 'both') {
      await generateMultiTurnDatasetsForQuestions({
        taskId: task.id,
        projectId,
        model: modelInfo,
        language,
        progress,
        concurrencyLimit
      });
    }

    // 任务完成
    await updateTask(task.id, {
      status: 1,
      completedCount: progress.datasetsBuilt + progress.multiTurnDatasetsBuilt,
      detail: `Distillation completed: tags ${progress.tagsBuilt}/${progress.tagsTotal}, questions ${progress.questionsBuilt}/${progress.questionsTotal}, single-turn datasets ${progress.datasetsBuilt}/${progress.datasetsTotal}, multi-turn datasets ${progress.multiTurnDatasetsBuilt}/${progress.multiTurnDatasetsTotal}`,
      endTime: new Date()
    });

    console.log(`Data distillation task completed: ${task.id}`);
  } catch (error) {
    console.error('Data distillation task error:', error);
    await updateTask(task.id, {
      status: 2,
      detail: `Processing failed: ${error.message}`,
      note: `Processing failed: ${error.message}`,
      endTime: new Date()
    });
  }
}

/**
 * 构建标签树
 */
async function buildTagTree({
  taskId,
  projectId,
  topic,
  levels,
  tagsPerLevel,
  model,
  language,
  progress,
  concurrencyLimit
}) {
  console.log(`[Task ${taskId}] Starting tag tree build (levels: ${levels}, tags/level: ${tagsPerLevel})`);

  // 更新任务状态
  await updateTask(taskId, {
    detail: `Building tag tree (levels: ${levels})`
  });

  // 获取项目名称作为根标签
  let projectName = topic;
  try {
    const projectResponse = await axios.get(`http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}`);
    if (projectResponse && projectResponse.data && projectResponse.data.name) {
      projectName = projectResponse.data.name;
      console.log(`[Task ${taskId}] Using project name as root tag: "${projectName}"`);
    }
  } catch (error) {
    console.warn(`[Task ${taskId}] Failed to fetch project name, using topic as default: ${error.message}`);
  }

  // 递归构建标签树
  const buildTagsForLevel = async (parentTag = null, parentTagPath = '', level = 1) => {
    // 检查任务是否被中断
    const latestTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (latestTask.status === 2 || latestTask.status === 3) {
      throw new Error('Task was interrupted');
    }

    if (level > levels) return;

    // 更新阶段
    await updateTask(taskId, {
      detail: `Building level ${level} tags...`
    });

    // 获取当前层级已有标签
    let currentLevelTags = [];
    try {
      const response = await axios.get(
        `http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}/distill/tags/all`
      );
      if (parentTag) {
        currentLevelTags = response.data.filter(tag => tag.parentId === parentTag.id);
      } else {
        currentLevelTags = response.data.filter(tag => !tag.parentId);
      }
    } catch (error) {
      console.error(`[Task ${taskId}] Failed to fetch level ${level} tags:`, error.message);
      return;
    }

    // 计算需要创建的标签数量
    const needToCreate = Math.max(0, tagsPerLevel - currentLevelTags.length);

    if (needToCreate > 0) {
      const parentTagName = level === 1 ? topic : parentTag?.label || '';
      let tagPathWithProjectName;
      if (level === 1) {
        tagPathWithProjectName = projectName;
      } else {
        if (!parentTagPath) {
          tagPathWithProjectName = projectName;
        } else if (!parentTagPath.startsWith(projectName)) {
          tagPathWithProjectName = `${projectName} > ${parentTagPath}`;
        } else {
          tagPathWithProjectName = parentTagPath;
        }
      }

      try {
        const response = await axios.post(
          `http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}/distill/tags`,
          {
            parentTag: parentTagName,
            parentTagId: parentTag ? parentTag.id : null,
            tagPath: tagPathWithProjectName || parentTagName,
            count: needToCreate,
            model,
            language
          }
        );

        // 更新进度
        progress.tagsBuilt += response.data.length;
        await updateTask(taskId, {
          detail: `Created ${progress.tagsBuilt}/${progress.tagsTotal} tags (level ${level})`
        });

        currentLevelTags = [...currentLevelTags, ...response.data];
      } catch (error) {
        console.error(`[Task ${taskId}] Failed to create level ${level} tags:`, error.message);
      }
    }

    // 递归构建下一层
    if (level < levels) {
      for (const tag of currentLevelTags) {
        let tagPath;
        if (parentTagPath) {
          tagPath = `${parentTagPath} > ${tag.label}`;
        } else {
          tagPath = `${projectName} > ${tag.label}`;
        }
        await buildTagsForLevel(tag, tagPath, level + 1);
      }
    }
  };

  // 从第一层开始构建
  await buildTagsForLevel();

  console.log(`[Task ${taskId}] Tag tree build completed: ${progress.tagsBuilt}/${progress.tagsTotal}`);
}

/**
 * 为标签生成问题
 */
async function generateQuestionsForTags({
  taskId,
  projectId,
  levels,
  questionsPerTag,
  model,
  language,
  progress,
  concurrencyLimit
}) {
  console.log(`[Task ${taskId}] Starting question generation`);

  await updateTask(taskId, {
    detail: 'Generating questions for leaf tags...'
  });

  try {
    // 获取项目名称
    let projectName = '';
    try {
      const projectResponse = await axios.get(`http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}`);
      if (projectResponse && projectResponse.data && projectResponse.data.name) {
        projectName = projectResponse.data.name;
      }
    } catch (error) {
      console.warn(`[Task ${taskId}] Failed to fetch project name: ${error.message}`);
    }

    // 获取所有标签
    const response = await axios.get(
      `http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}/distill/tags/all`
    );
    const allTags = response.data;

    // 找出所有叶子标签
    const childrenMap = {};
    allTags.forEach(tag => {
      if (tag.parentId) {
        if (!childrenMap[tag.parentId]) {
          childrenMap[tag.parentId] = [];
        }
        childrenMap[tag.parentId].push(tag);
      }
    });

    const leafTags = allTags.filter(tag => !childrenMap[tag.id] && getTagDepth(tag, allTags) === levels);

    // 获取所有问题
    const questionsResponse = await axios.get(
      `http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}/questions/tree?isDistill=true`
    );
    const allQuestions = questionsResponse.data;

    // 更新总问题数量
    progress.questionsTotal = leafTags.length * questionsPerTag;

    // 准备生成任务
    const generateTasks = [];
    for (const tag of leafTags) {
      const tagPath = getTagPath(tag, allTags, projectName);
      const existingQuestions = allQuestions.filter(q => q.label === tag.label);
      const needToCreate = Math.max(0, questionsPerTag - existingQuestions.length);

      if (needToCreate > 0) {
        generateTasks.push({ tag, tagPath, needToCreate });
      }
    }

    console.log(`[Task ${taskId}] Generating ${progress.questionsTotal} questions for ${generateTasks.length} tags`);

    // 分批并发生成问题
    for (let i = 0; i < generateTasks.length; i += concurrencyLimit) {
      // 检查任务是否被中断
      const latestTask = await prisma.task.findUnique({ where: { id: taskId } });
      if (latestTask.status === 2 || latestTask.status === 3) {
        throw new Error('Task was interrupted');
      }

      const batch = generateTasks.slice(i, i + concurrencyLimit);

      await Promise.all(
        batch.map(async ({ tag, tagPath, needToCreate }) => {
          try {
            const response = await axios.post(
              `http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}/distill/questions`,
              {
                tagPath,
                currentTag: tag.label,
                tagId: tag.id,
                count: needToCreate,
                model,
                language
              }
            );

            progress.questionsBuilt += response.data.length;
            await updateTask(taskId, {
              detail: `[Data distillation task ${taskId}] Generated ${progress.questionsBuilt}/${progress.questionsTotal} questions`
            });
            console.log(
              `[Data distillation task ${taskId}] Generated ${progress.questionsBuilt}/${progress.questionsTotal} questions`
            );
          } catch (error) {
            console.error(`[Task ${taskId}] Failed to generate questions for tag "${tag.label}":`, error.message);
          }
        })
      );
    }
  } catch (error) {
    console.error(`[Task ${taskId}] Question generation failed:`, error.message);
    throw error;
  }

  console.log(`[Task ${taskId}] Question generation completed: ${progress.questionsBuilt}/${progress.questionsTotal}`);
}

/**
 * 为问题生成数据集
 */
async function generateDatasetsForQuestions({ taskId, projectId, model, language, progress, concurrencyLimit }) {
  console.log(`[Task ${taskId}] Starting single-turn dataset generation`);

  await updateTask(taskId, {
    detail: 'Generating single-turn datasets...'
  });

  try {
    // 获取所有问题
    const response = await axios.get(
      `http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}/questions/tree?isDistill=true`
    );
    const allQuestions = response.data;

    // 找出未回答的问题
    const unansweredQuestions = allQuestions.filter(q => !q.answered);
    const answeredQuestions = allQuestions.filter(q => q.answered);

    // 更新数据集总数和已生成数量
    progress.datasetsTotal = allQuestions.length;
    progress.datasetsBuilt = answeredQuestions.length;

    if (unansweredQuestions.length === 0) {
      console.log(`[Task ${taskId}] All questions already have answers; skipping dataset generation`);
      return;
    }

    console.log(`[Task ${taskId}] Generating answers for ${unansweredQuestions.length} questions`);

    // 分批并发生成数据集
    for (let i = 0; i < unansweredQuestions.length; i += concurrencyLimit) {
      // 检查任务是否被中断
      const latestTask = await prisma.task.findUnique({ where: { id: taskId } });
      if (latestTask.status === 2 || latestTask.status === 3) {
        throw new Error('Task was interrupted');
      }

      const batch = unansweredQuestions.slice(i, i + concurrencyLimit);

      await Promise.all(
        batch.map(async question => {
          try {
            await axios.post(`http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}/datasets`, {
              projectId,
              questionId: question.id,
              model,
              language: language || 'zh-CN'
            });

            progress.datasetsBuilt++;
            await updateTask(taskId, {
              completedCount: progress.datasetsBuilt,
              detail: `[Data distillation task ${taskId}] Generated ${progress.datasetsBuilt}/${progress.datasetsTotal} single-turn datasets`
            });
            console.log(`Generated ${progress.datasetsBuilt}/${progress.datasetsTotal} single-turn datasets`);
          } catch (error) {
            console.error(`[Task ${taskId}] Failed to generate dataset for question "${question.id}":`, error.message);
          }
        })
      );
    }
  } catch (error) {
    console.error(`[Task ${taskId}] Dataset generation failed:`, error.message);
    throw error;
  }

  console.log(
    `[Task ${taskId}] Single-turn dataset generation completed: ${progress.datasetsBuilt}/${progress.datasetsTotal}`
  );
}

/**
 * 为问题生成多轮对话数据集
 */
async function generateMultiTurnDatasetsForQuestions({
  taskId,
  projectId,
  model,
  language,
  progress,
  concurrencyLimit
}) {
  console.log(`[Task ${taskId}] Starting multi-turn dataset generation`);

  await updateTask(taskId, {
    detail: 'Generating multi-turn datasets...'
  });

  try {
    // 获取项目的多轮对话配置
    const configResponse = await axios.get(
      `http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}/tasks`
    );
    const taskConfig = configResponse.data;

    const multiTurnConfig = {
      systemPrompt: taskConfig.multiTurnSystemPrompt || '',
      scenario: taskConfig.multiTurnScenario || '',
      rounds: taskConfig.multiTurnRounds || 3,
      roleA: taskConfig.multiTurnRoleA || '',
      roleB: taskConfig.multiTurnRoleB || ''
    };

    // 检查配置
    if (!multiTurnConfig.scenario || !multiTurnConfig.roleA || !multiTurnConfig.roleB || !multiTurnConfig.rounds) {
      console.error(`[Task ${taskId}] Project is missing multi-turn config; skipping multi-turn generation`);
      throw new Error('Project is missing multi-turn config');
    }

    // 获取所有已回答的问题
    const response = await axios.get(
      `http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}/questions/tree?isDistill=true`
    );
    const answeredQuestions = response.data;

    // 获取已生成多轮对话的问题ID
    const conversationsResponse = await axios.get(
      `http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}/dataset-conversations?pageSize=1000`
    );
    const existingConversationIds = new Set(
      (conversationsResponse.data.conversations || []).map(conv => conv.questionId)
    );

    // 筛选需要生成多轮对话的问题
    const questionsForMultiTurn = answeredQuestions.filter(q => !existingConversationIds.has(q.id));

    // 更新多轮对话数据集总数和已生成数量
    progress.multiTurnDatasetsTotal = answeredQuestions.length;
    progress.multiTurnDatasetsBuilt = answeredQuestions.length - questionsForMultiTurn.length;

    if (questionsForMultiTurn.length === 0) {
      console.log(`[Task ${taskId}] All questions already have multi-turn conversations; skipping`);
      return;
    }

    console.log(`[Task ${taskId}] Generating multi-turn conversations for ${questionsForMultiTurn.length} questions`);

    // 分批并发生成 (并发数更低)
    const multiTurnConcurrency = Math.min(concurrencyLimit, 2);

    for (let i = 0; i < questionsForMultiTurn.length; i += multiTurnConcurrency) {
      // 检查任务是否被中断
      const latestTask = await prisma.task.findUnique({ where: { id: taskId } });
      if (latestTask.status === 2 || latestTask.status === 3) {
        throw new Error('Task was interrupted');
      }

      const batch = questionsForMultiTurn.slice(i, i + multiTurnConcurrency);

      await Promise.all(
        batch.map(async question => {
          try {
            await axios.post(
              `http://localhost:${process.env.PORT || 1717}/api/projects/${projectId}/dataset-conversations`,
              {
                questionId: question.id,
                ...multiTurnConfig,
                model,
                language
              }
            );

            progress.multiTurnDatasetsBuilt++;
            await updateTask(taskId, {
              completedCount: progress.multiTurnDatasetsBuilt,
              detail: `Generated ${progress.multiTurnDatasetsBuilt}/${progress.multiTurnDatasetsTotal} multi-turn datasets`
            });
            console.log(
              `Generated ${progress.multiTurnDatasetsBuilt}/${progress.multiTurnDatasetsTotal} multi-turn datasets`
            );
          } catch (error) {
            console.error(
              `[Task ${taskId}] Failed to generate multi-turn conversation for question "${question.id}":`,
              error.message
            );
          }
        })
      );
    }
  } catch (error) {
    console.error(`[Task ${taskId}] Multi-turn dataset generation failed:`, error.message);
    throw error;
  }

  console.log(
    `[Task ${taskId}] Multi-turn dataset generation completed: ${progress.multiTurnDatasetsBuilt}/${progress.multiTurnDatasetsTotal}`
  );
}

/**
 * 获取标签深度
 */
function getTagDepth(tag, allTags) {
  let depth = 1;
  let currentTag = tag;

  while (currentTag.parentId) {
    depth++;
    currentTag = allTags.find(t => t.id === currentTag.parentId);
    if (!currentTag) break;
  }

  return depth;
}

/**
 * 获取标签路径
 */
function getTagPath(tag, allTags, projectName = '') {
  const path = [];
  let currentTag = tag;

  while (currentTag) {
    path.unshift(currentTag.label);
    if (currentTag.parentId) {
      currentTag = allTags.find(t => t.id === currentTag.parentId);
    } else {
      currentTag = null;
    }
  }

  // 如果有项目名称且路径不以项目名称开头,则添加
  if (projectName && path.length > 0 && path[0] !== projectName) {
    path.unshift(projectName);
  }

  return path.join(' > ');
}

export default {
  processDataDistillationTask
};
