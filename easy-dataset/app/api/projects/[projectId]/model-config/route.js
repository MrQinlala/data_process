import { NextResponse } from 'next/server';
import { createInitModelConfig, getModelConfigByProjectId, saveModelConfig } from '@/lib/db/model-config';
import { DEFAULT_MODEL_SETTINGS, MODEL_PROVIDERS } from '@/constant/model';
import { getProject } from '@/lib/db/projects';
import { sortProvidersByPriority } from '@/lib/util/providerLogo';

function normalizeModelEndpoint(endpoint = '') {
  let normalizedEndpoint = String(endpoint).trim();
  if (!normalizedEndpoint) {
    return '';
  }
  if (normalizedEndpoint.includes('/chat/completions')) {
    normalizedEndpoint = normalizedEndpoint.replace('/chat/completions', '');
  }
  return normalizedEndpoint;
}

// 获取模型配置列表
export async function GET(request, { params }) {
  try {
    const { projectId } = params;
    // 验证项目 ID
    if (!projectId) {
      return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
    }
    let modelConfigList = await getModelConfigByProjectId(projectId);
    if (!modelConfigList || modelConfigList.length === 0) {
      let insertModelConfigList = [];
      const sortedProviders = sortProvidersByPriority(MODEL_PROVIDERS, item => item.id);
      sortedProviders.forEach(item => {
        let data = {
          projectId: projectId,
          providerId: item.id,
          providerName: item.name,
          endpoint: item.defaultEndpoint,
          apiKey: '',
          modelId: '',
          modelName: '',
          type: 'text',
          temperature: DEFAULT_MODEL_SETTINGS.temperature,
          maxTokens: DEFAULT_MODEL_SETTINGS.maxTokens,
          topK: 0,
          topP: DEFAULT_MODEL_SETTINGS.topP,
          status: 1
        };
        insertModelConfigList.push(data);
      });
      modelConfigList = await createInitModelConfig(insertModelConfigList);
    }
    modelConfigList = sortProvidersByPriority(modelConfigList, item => item.providerId);
    let project = await getProject(projectId);
    return NextResponse.json({ data: modelConfigList, defaultModelConfigId: project.defaultModelConfigId });
  } catch (error) {
    console.error('Error obtaining model configuration:', String(error));
    return NextResponse.json({ error: 'Failed to obtain model configuration' }, { status: 500 });
  }
}

// 保存模型配置
export async function POST(request, { params }) {
  try {
    const { projectId } = params;

    // 验证项目 ID
    if (!projectId) {
      return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
    }
    // 获取请求体
    const modelConfig = await request.json();

    // 验证请求体
    if (!modelConfig) {
      return NextResponse.json({ error: 'The model configuration cannot be empty ' }, { status: 400 });
    }
    modelConfig.projectId = projectId;
    modelConfig.endpoint = normalizeModelEndpoint(modelConfig.endpoint);
    // 如果没有 modelId，使用 modelName 补齐（兼容旧逻辑）
    if (!modelConfig.modelId && modelConfig.modelName) {
      modelConfig.modelId = modelConfig.modelName;
    }
    // 如果没有 modelName，使用 modelId 补齐
    if (!modelConfig.modelName && modelConfig.modelId) {
      modelConfig.modelName = modelConfig.modelId;
    }
    if (!modelConfig.topK) {
      modelConfig.topK = 0;
    }
    if (!modelConfig.status) {
      modelConfig.status = 1;
    }
    const parsedMaxTokens = Number(modelConfig.maxTokens ?? DEFAULT_MODEL_SETTINGS.maxTokens);
    if (!Number.isInteger(parsedMaxTokens) || parsedMaxTokens < 1) {
      return NextResponse.json({ error: 'maxTokens must be a positive integer' }, { status: 400 });
    }
    modelConfig.maxTokens = parsedMaxTokens;
    const res = await saveModelConfig(modelConfig);

    return NextResponse.json(res);
  } catch (error) {
    console.error('Error updating model configuration:', String(error));
    return NextResponse.json({ error: 'Failed to update model configuration' }, { status: 500 });
  }
}
