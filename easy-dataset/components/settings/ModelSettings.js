'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Autocomplete,
  Slider,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  Tooltip,
  IconButton,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { DEFAULT_MODEL_SETTINGS } from '@/constant/model';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScienceIcon from '@mui/icons-material/Science';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/lib/store';
import { getProviderLogo, sortProvidersByPriority } from '@/lib/util/providerLogo';

export default function ModelSettings({ projectId }) {
  const { t } = useTranslation();
  const router = useRouter();
  // 展示端点的最大长度
  const MAX_ENDPOINT_DISPLAY = 80;
  const MAX_GENERATION_TOKENS = 131072;
  // 模型对话框状态
  const [openModelDialog, setOpenModelDialog] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerList, setProviderList] = useState([]);
  const [providerOptions, setProviderOptions] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState({});
  const [models, setModels] = useState([]);
  const [modelConfigList, setModelConfigList] = useAtom(modelConfigListAtom);
  const [selectedModelInfo, setSelectedModelInfo] = useAtom(selectedModelInfoAtom);
  const orderedModelConfigList = useMemo(
    () => sortProvidersByPriority(modelConfigList, item => item.providerId),
    [modelConfigList]
  );
  const [modelConfigForm, setModelConfigForm] = useState({
    id: '',
    providerId: '',
    providerName: '',
    endpoint: '',
    apiKey: '',
    modelId: '',
    modelName: '',
    type: 'text',
    temperature: 0.0,
    maxTokens: DEFAULT_MODEL_SETTINGS.maxTokens,
    topP: 0,
    topK: 0,
    status: 1
  });
  const [healthStatusMap, setHealthStatusMap] = useState({});
  const [batchCheckingHealth, setBatchCheckingHealth] = useState(false);

  const isModelConfigured = model => {
    if (!model) return false;
    const hasEndpoint = Boolean(String(model.endpoint || '').trim());
    const hasModel = Boolean(String(model.modelId || model.modelName || '').trim());
    const providerId = String(model.providerId || '').toLowerCase();

    if (providerId === 'ollama') {
      return hasEndpoint && hasModel;
    }

    const hasApiKey = Boolean(String(model.apiKey || '').trim());
    return hasEndpoint && hasApiKey && hasModel;
  };

  const configuredModelList = useMemo(() => orderedModelConfigList.filter(isModelConfigured), [orderedModelConfigList]);

  const unconfiguredModelList = useMemo(
    () => orderedModelConfigList.filter(model => !isModelConfigured(model)),
    [orderedModelConfigList]
  );

  const normalizePositiveInteger = value => {
    const parsedValue = Number(value);
    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
      return null;
    }
    return parsedValue;
  };

  const getSafeMaxTokensValue = value => {
    return normalizePositiveInteger(value) ?? DEFAULT_MODEL_SETTINGS.maxTokens;
  };

  useEffect(() => {
    getProvidersList();
    getModelConfigList();
  }, []);

  // 获取提供商列表
  const getProvidersList = () => {
    axios.get('/api/llm/providers').then(response => {
      console.log('获取的模型列表', response.data);
      const sortedProviders = sortProvidersByPriority(response.data, item => item.id);
      setProviderList(sortedProviders);
      const providerOptions = sortedProviders.map(provider => ({
        id: provider.id,
        label: provider.name
      }));
      if (sortedProviders.length > 0) {
        setSelectedProvider(sortedProviders[0]);
        getProviderModels(sortedProviders[0].id);
      }
      setProviderOptions(providerOptions);
    });
  };

  // 裁剪端点展示长度（不改变实际值，仅用于 UI 展示）
  const formatEndpoint = model => {
    if (!model?.endpoint) return '';
    const base = model.endpoint.replace(/^https?:\/\//, '');
    if (base.length > MAX_ENDPOINT_DISPLAY) {
      return base.slice(0, MAX_ENDPOINT_DISPLAY) + '...';
    }
    return base;
  };

  // 获取模型配置列表
  const getModelConfigList = () => {
    axios
      .get(`/api/projects/${projectId}/model-config`)
      .then(response => {
        setModelConfigList(sortProvidersByPriority(response.data.data, item => item.providerId));
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        toast.error('Fetch model list Error');
      });
  };

  const onChangeProvider = (event, newValue) => {
    console.log('选择提供商', newValue, typeof newValue);
    if (typeof newValue === 'string') {
      // 用户手动输入了自定义提供商
      setModelConfigForm(prev => ({
        ...prev,
        providerId: 'custom',
        endpoint: '',
        providerName: ''
      }));
    } else if (newValue && newValue.id) {
      // 用户从下拉列表中选择了一个提供商
      const selectedProvider = providerList.find(p => p.id === newValue.id);
      if (selectedProvider) {
        setSelectedProvider(selectedProvider);
        setModelConfigForm(prev => ({
          ...prev,
          providerId: selectedProvider.id,
          endpoint: selectedProvider.apiUrl,
          providerName: selectedProvider.name,
          modelName: ''
        }));
        getProviderModels(newValue.id);
      }
    }
  };

  // 获取提供商的模型列表（DB）
  const getProviderModels = providerId => {
    axios
      .get(`/api/llm/model?providerId=${providerId}`)
      .then(response => {
        setModels(response.data);
      })
      .catch(error => {
        toast.error('Get Models Error');
      });
  };

  // 同步模型列表
  const refreshProviderModels = async () => {
    let data = await getNewModels();
    if (!data) return;
    if (data.length > 0) {
      setModels(data);
      toast.success('Refresh Success');
      const newModelsData = await axios.post('/api/llm/model', {
        newModels: data,
        providerId: selectedProvider.id
      });
      if (newModelsData.status === 200) {
        toast.success('Get Model Success');
      }
    } else {
      toast.info('No Models Need Refresh');
    }
  };

  // 获取最新模型列表
  async function getNewModels() {
    try {
      if (!modelConfigForm || !modelConfigForm.endpoint) {
        return null;
      }
      const providerId = modelConfigForm.providerId;
      console.log(providerId, 'getNewModels providerId');

      // 使用后端 API 代理请求
      const res = await axios.post('/api/llm/fetch-models', {
        endpoint: modelConfigForm.endpoint,
        providerId: providerId,
        apiKey: modelConfigForm.apiKey
      });

      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 401) {
        toast.error('API Key Invalid');
      } else {
        toast.error('Get Model List Error');
      }
      return null;
    }
  }

  const getHealthCheckErrorMessage = error => {
    if (error?.response?.data?.error) return String(error.response.data.error);
    if (error?.response?.data?.message) return String(error.response.data.message);
    if (error?.message) return String(error.message);
    return t('models.endpointCheckFailed', { defaultValue: 'Endpoint check failed' });
  };

  const checkModelEndpointHealth = async (model, { silent = false } = {}) => {
    if (!model?.id) return false;

    const endpoint = String(model.endpoint || '').trim();
    if (!endpoint) {
      setHealthStatusMap(prev => ({
        ...prev,
        [model.id]: {
          status: 'error',
          message: t('models.endpointMissing', { defaultValue: 'Endpoint is empty' })
        }
      }));
      if (!silent) {
        toast.error(t('models.endpointMissing', { defaultValue: 'Endpoint is empty' }));
      }
      return false;
    }

    setHealthStatusMap(prev => ({
      ...prev,
      [model.id]: {
        status: 'checking',
        message: t('models.checking', { defaultValue: 'Checking...' })
      }
    }));

    try {
      const response = await axios.post('/api/llm/fetch-models', {
        endpoint,
        providerId: model.providerId,
        apiKey: model.apiKey
      });

      const resultList = Array.isArray(response.data) ? response.data : [];
      const currentModelId = String(model.modelId || model.modelName || '').trim();
      const hasMatchedModel =
        !currentModelId ||
        resultList.some(item => {
          return item?.modelId === currentModelId || item?.modelName === currentModelId;
        });

      if (!hasMatchedModel) {
        setHealthStatusMap(prev => ({
          ...prev,
          [model.id]: {
            status: 'warning',
            message: t('models.endpointReachableModelMissing', {
              defaultValue: 'Endpoint reachable, but current model is not in the returned model list'
            }),
            checkedAt: Date.now()
          }
        }));
        if (!silent) {
          toast.warning(
            t('models.endpointReachableModelMissing', {
              defaultValue: 'Endpoint reachable, but current model is not in the returned model list'
            })
          );
        }
        return true;
      }

      setHealthStatusMap(prev => ({
        ...prev,
        [model.id]: {
          status: 'success',
          message: t('models.endpointHealthy', { defaultValue: 'Endpoint is healthy' }),
          checkedAt: Date.now()
        }
      }));
      if (!silent) {
        toast.success(t('models.endpointHealthy', { defaultValue: 'Endpoint is healthy' }));
      }
      return true;
    } catch (error) {
      const message = getHealthCheckErrorMessage(error);
      setHealthStatusMap(prev => ({
        ...prev,
        [model.id]: {
          status: 'error',
          message,
          checkedAt: Date.now()
        }
      }));
      if (!silent) {
        toast.error(message);
      }
      return false;
    }
  };

  const checkAllConfiguredModelHealth = async () => {
    if (configuredModelList.length === 0) {
      toast.info(t('models.noConfiguredModels', { defaultValue: 'No configured models to check' }));
      return;
    }

    setBatchCheckingHealth(true);
    let okCount = 0;
    let failCount = 0;

    for (const model of configuredModelList) {
      const isHealthy = await checkModelEndpointHealth(model, { silent: true });
      if (isHealthy) {
        okCount += 1;
      } else {
        failCount += 1;
      }
    }

    setBatchCheckingHealth(false);
    toast.success(
      t('models.healthCheckSummary', {
        defaultValue: `Health check completed: ${okCount} healthy, ${failCount} failed`,
        okCount,
        failCount
      })
    );
  };

  const getHealthStatusInfo = model => {
    const status = healthStatusMap[model.id]?.status || 'idle';
    const message = healthStatusMap[model.id]?.message;

    if (status === 'checking') {
      return {
        color: 'default',
        icon: <CircularProgress size={14} />,
        label: t('models.checking', { defaultValue: 'Checking...' }),
        message
      };
    }

    if (status === 'success') {
      return {
        color: 'success',
        icon: <CheckCircleIcon fontSize="small" />,
        label: t('models.healthy', { defaultValue: 'Healthy' }),
        message
      };
    }

    if (status === 'warning') {
      return {
        color: 'warning',
        icon: <ErrorIcon fontSize="small" />,
        label: t('models.reachable', { defaultValue: 'Reachable' }),
        message
      };
    }

    if (status === 'error') {
      return {
        color: 'error',
        icon: <ErrorIcon fontSize="small" />,
        label: t('models.unhealthy', { defaultValue: 'Unhealthy' }),
        message
      };
    }

    return {
      color: 'default',
      icon: <HealthAndSafetyIcon fontSize="small" />,
      label: t('models.notChecked', { defaultValue: 'Not checked' }),
      message: t('models.notChecked', { defaultValue: 'Not checked' })
    };
  };

  // 打开模型对话框
  const handleOpenModelDialog = (model = null) => {
    if (model) {
      setEditingModel(model);
      console.log('handleOpenModelDialog', model);
      // 兼容逻辑：如果 modelId 为空，则用 modelName 作为 modelId
      const initialForm = { ...model };
      if (!initialForm.modelId && initialForm.modelName) {
        initialForm.modelId = initialForm.modelName;
      }

      // 编辑现有模型时，为未设置的参数应用默认值
      setModelConfigForm({
        ...initialForm,
        temperature: model.temperature !== undefined ? model.temperature : DEFAULT_MODEL_SETTINGS.temperature,
        maxTokens: model.maxTokens !== undefined ? model.maxTokens : DEFAULT_MODEL_SETTINGS.maxTokens,
        topP: model.topP !== undefined && model.topP !== 0 ? model.topP : DEFAULT_MODEL_SETTINGS.topP
      });
      getProviderModels(model.providerId);
    } else {
      setEditingModel(null);
      // 添加新模型时，完全重置表单
      setModelConfigForm({
        providerId: selectedProvider?.id || '',
        providerName: selectedProvider?.name || '',
        endpoint: selectedProvider?.apiUrl || '',
        apiKey: '',
        modelId: '',
        modelName: '',
        type: 'text',
        ...DEFAULT_MODEL_SETTINGS,
        id: ''
      });
      if (selectedProvider?.id) {
        getProviderModels(selectedProvider.id);
      }
    }
    setOpenModelDialog(true);
  };

  // 关闭模型对话框
  const handleCloseModelDialog = () => {
    setEditingModel(null);
    setOpenModelDialog(false);
  };

  // 处理模型表单变更
  const handleModelFormChange = e => {
    const { name, value } = e.target;
    console.log('handleModelFormChange', name, value);
    setModelConfigForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMaxTokensSliderChange = (event, newValue) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    const normalizedValue = normalizePositiveInteger(value);
    if (normalizedValue === null) {
      return;
    }
    setModelConfigForm(prev => ({
      ...prev,
      maxTokens: normalizedValue
    }));
  };

  const handleMaxTokensInputChange = e => {
    const { value } = e.target;
    if (value === '') {
      setModelConfigForm(prev => ({
        ...prev,
        maxTokens: ''
      }));
      return;
    }
    const normalizedValue = normalizePositiveInteger(value);
    if (normalizedValue === null) {
      return;
    }
    setModelConfigForm(prev => ({
      ...prev,
      maxTokens: normalizedValue
    }));
  };

  const handleMaxTokensInputBlur = () => {
    const normalizedValue = normalizePositiveInteger(modelConfigForm.maxTokens);
    if (normalizedValue !== null) {
      return;
    }
    setModelConfigForm(prev => ({
      ...prev,
      maxTokens: DEFAULT_MODEL_SETTINGS.maxTokens
    }));
  };

  // 保存模型
  const handleSaveModel = () => {
    // 确保有模型 ID
    const normalizedModelId = String(modelConfigForm.modelId || '').trim();
    const normalizedModelName = String(modelConfigForm.modelName || '').trim();
    const isEditingExistingModel = Boolean(modelConfigForm.id || editingModel?.id);

    if (!isEditingExistingModel && !normalizedModelId) {
      toast.error(t('models.modelIdPlaceholder'));
      return;
    }

    const normalizedMaxTokens = normalizePositiveInteger(modelConfigForm.maxTokens);
    if (normalizedMaxTokens === null) {
      toast.error(t('models.maxTokensPositiveError', { defaultValue: 'Max Tokens must be a positive integer' }));
      return;
    }

    // 如果模型名称为空，则默认为模型 ID
    const dataToSave = {
      ...modelConfigForm,
      modelId: normalizedModelId,
      maxTokens: normalizedMaxTokens,
      modelName: normalizedModelName || normalizedModelId
    };

    axios
      .post(`/api/projects/${projectId}/model-config`, dataToSave)
      .then(response => {
        if (selectedModelInfo && selectedModelInfo.id === response.data.id) {
          setSelectedModelInfo(response.data);
        }
        toast.success(t('settings.saveSuccess'));
        getModelConfigList();
        handleCloseModelDialog();
      })
      .catch(error => {
        toast.error(t('settings.saveFailed'));
        console.error(error);
      });
  };

  // 删除模型
  const handleDeleteModel = id => {
    axios
      .delete(`/api/projects/${projectId}/model-config/${id}`)
      .then(response => {
        toast.success(t('settings.deleteSuccess'));
        getModelConfigList();
      })
      .catch(error => {
        toast.error(t('settings.deleteFailed'));
      });
  };

  // 获取模型状态图标和颜色
  const getModelStatusInfo = model => {
    const providerId = String(model?.providerId || '').toLowerCase();
    if (providerId === 'ollama') {
      return {
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'success',
        text: t('models.localModel')
      };
    } else if (model.apiKey) {
      return {
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'success',
        text: t('models.apiKeyConfigured')
      };
    } else {
      return {
        icon: <ErrorIcon fontSize="small" />,
        color: 'warning',
        text: t('models.apiKeyNotConfigured')
      };
    }
  };

  const renderModelCard = model => {
    const modelStatus = getModelStatusInfo(model);
    const healthStatus = getHealthStatusInfo(model);
    const providerId = String(model?.providerId || '').toLowerCase();
    const endpointLabel = `${formatEndpoint(model)}${
      providerId !== 'ollama' && !model.apiKey ? ' (' + t('models.unconfiguredAPIKey') + ')' : ''
    }`;

    return (
      <Paper
        key={model.id}
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src={getProviderLogo(model.providerId, model.providerName)}
              alt={model.providerName}
              sx={{ width: 32, height: 32, objectFit: 'contain' }}
              onError={e => {
                e.target.src = '/imgs/models/default.svg';
              }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {model.modelName ? model.modelName : t('models.unselectedModel')}
              </Typography>
              <Typography
                variant="body2"
                color="primary"
                sx={{
                  fontWeight: 'medium',
                  bgcolor: 'primary.50',
                  px: 1,
                  py: 0.2,
                  borderRadius: 1,
                  display: 'inline-block'
                }}
              >
                {model.providerName}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Tooltip title={modelStatus.text}>
              <Chip
                icon={modelStatus.icon}
                label={endpointLabel}
                size="small"
                color={modelStatus.color}
                variant="outlined"
              />
            </Tooltip>

            <Tooltip title={healthStatus.message || healthStatus.label}>
              <Chip
                icon={healthStatus.icon}
                label={healthStatus.label}
                size="small"
                color={healthStatus.color}
                variant="outlined"
              />
            </Tooltip>

            <Tooltip title={t('models.checkEndpointHealth', { defaultValue: 'Check endpoint health' })}>
              <span>
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => checkModelEndpointHealth(model)}
                  disabled={healthStatusMap[model.id]?.status === 'checking'}
                >
                  <HealthAndSafetyIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={t('models.typeTips')}>
              <Chip
                sx={{ marginLeft: '5px' }}
                label={t(`models.${model.type || 'text'}`)}
                size="small"
                color={model.type === 'vision' ? 'secondary' : 'info'}
                variant="outlined"
              />
            </Tooltip>
            <Tooltip title={t('playground.title')}>
              <IconButton
                size="small"
                onClick={() => router.push(`/projects/${projectId}/playground?modelId=${model.id}`)}
                color="secondary"
              >
                <ScienceIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('common.edit')}>
              <IconButton size="small" onClick={() => handleOpenModelDialog(model)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('common.delete')}>
              <IconButton
                size="small"
                onClick={() => handleDeleteModel(model.id)}
                disabled={modelConfigList.length <= 1}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    );
  };

  if (loading) {
    return <Typography>{t('textSplit.loading')}</Typography>;
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            {t('settings.modelConfig')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="success"
              startIcon={batchCheckingHealth ? <CircularProgress size={14} /> : <HealthAndSafetyIcon />}
              onClick={checkAllConfiguredModelHealth}
              size="small"
              disabled={batchCheckingHealth || configuredModelList.length === 0}
              sx={{ textTransform: 'none' }}
            >
              {batchCheckingHealth
                ? t('models.checking', { defaultValue: 'Checking...' })
                : t('models.checkAllEndpointHealth', { defaultValue: 'Check all endpoints' })}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ScienceIcon />}
              onClick={() => router.push(`/projects/${projectId}/playground`)}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              {t('playground.title')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModelDialog()}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              {t('models.add')}
            </Button>
          </Box>
        </Box>

        <Stack spacing={2}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('models.configuredModels', { defaultValue: 'Configured Models' })}
              </Typography>
              <Chip size="small" label={configuredModelList.length} />
            </Box>
            <Stack spacing={2}>
              {configuredModelList.map(renderModelCard)}
              {configuredModelList.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  {t('models.noConfiguredModels', { defaultValue: 'No configured models' })}
                </Typography>
              )}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('models.unconfiguredModels', { defaultValue: 'Unconfigured Models' })}
              </Typography>
              <Chip size="small" label={unconfiguredModelList.length} />
            </Box>
            <Stack spacing={2}>
              {unconfiguredModelList.map(renderModelCard)}
              {unconfiguredModelList.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  {t('models.noUnconfiguredModels', { defaultValue: 'No unconfigured models' })}
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>

      {/* 模型表单对话框 */}
      <Dialog open={openModelDialog} onClose={handleCloseModelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingModel ? t('models.edit') : t('models.add')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* provider */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Autocomplete
                  freeSolo
                  options={providerOptions}
                  getOptionLabel={option => option.label}
                  value={
                    providerOptions.find(p => p.id === modelConfigForm.providerId) || {
                      id: 'custom',
                      label: modelConfigForm.providerName || ''
                    }
                  }
                  onChange={onChangeProvider}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t('models.provider')}
                      onChange={e => {
                        // 当用户手动输入时，更新 provider 字段
                        setModelConfigForm(prev => ({
                          ...prev,
                          providerId: 'custom',
                          providerName: e.target.value
                        }));
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    return (
                      <div {...props}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Box
                            component="img"
                            src={getProviderLogo(option.id, option.label)}
                            alt={option.label}
                            sx={{ width: 24, height: 24, objectFit: 'contain' }}
                            onError={e => {
                              e.target.src = '/imgs/models/default.svg';
                            }}
                          />
                          {option.label}
                        </div>
                      </div>
                    );
                  }}
                />
              </FormControl>
            </Grid>
            {/* 接口地址 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('models.endpoint')}
                name="endpoint"
                value={modelConfigForm.endpoint}
                onChange={handleModelFormChange}
                placeholder="例如: https://api.openai.com/v1"
              />
            </Grid>
            {/* API Key */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('models.apiKey')}
                name="apiKey"
                type="password"
                value={modelConfigForm.apiKey}
                onChange={handleModelFormChange}
                placeholder="例如: sk-..."
              />
            </Grid>
            {/* 模型 ID */}
            <Grid item xs={12} style={{ display: 'flex', alignItems: 'center' }}>
              <FormControl style={{ width: '70%' }}>
                <Autocomplete
                  freeSolo
                  options={models
                    .filter(model => model && model.modelId)
                    .map(model => ({
                      label: `${model.modelName} (${model.modelId})`,
                      modelName: model.modelName,
                      modelId: model.modelId,
                      providerId: model.providerId
                    }))}
                  value={modelConfigForm.modelId}
                  onChange={(event, newValue) => {
                    console.log('newValue', newValue);
                    const newId = newValue?.modelId || newValue || '';
                    const newName = newValue?.modelName || newValue?.modelId || newValue || '';
                    setModelConfigForm(prev => ({
                      ...prev,
                      modelId: newId,
                      // 如果当前名称为空或与旧 ID 一致，则同步更新名称
                      modelName: !prev.modelName || prev.modelName === prev.modelId ? newName : prev.modelName
                    }));
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t('models.modelId')}
                      placeholder={t('models.modelIdPlaceholder')}
                      onChange={e => {
                        setModelConfigForm(prev => ({
                          ...prev,
                          modelId: e.target.value
                        }));
                      }}
                    />
                  )}
                />
              </FormControl>
              <Button variant="contained" onClick={() => refreshProviderModels()} sx={{ ml: 2 }}>
                {t('models.refresh')}
              </Button>
            </Grid>
            {/* 模型名称 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('models.modelName')}
                name="modelName"
                value={modelConfigForm.modelName}
                onChange={handleModelFormChange}
                placeholder={t('models.modelNamePlaceholder')}
              />
            </Grid>
            {/* 新增：视觉模型选择项 */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('models.type')}</InputLabel>
                <Select
                  label={t('models.type')}
                  value={modelConfigForm.type || 'text'}
                  onChange={handleModelFormChange}
                  name="type"
                >
                  <MenuItem value="text">{t('models.text')}</MenuItem>
                  <MenuItem value="vision">{t('models.vision')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography id="question-generation-length-slider" gutterBottom>
                {t('models.temperature')}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Slider
                  min={0}
                  max={2}
                  name="temperature"
                  value={modelConfigForm.temperature}
                  onChange={handleModelFormChange}
                  step={0.1}
                  valueLabelDisplay="auto"
                  aria-label="Temperature"
                  sx={{ flex: 1 }}
                />
                <Typography variant="body2" sx={{ minWidth: '40px' }}>
                  {modelConfigForm.temperature}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography id="question-generation-length-slider" gutterBottom>
                {t('models.maxTokens')}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Slider
                  min={1}
                  max={MAX_GENERATION_TOKENS}
                  name="maxTokens"
                  value={Math.min(getSafeMaxTokensValue(modelConfigForm.maxTokens), MAX_GENERATION_TOKENS)}
                  onChange={handleMaxTokensSliderChange}
                  step={1}
                  valueLabelDisplay="auto"
                  aria-label="maxTokens"
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  type="number"
                  value={modelConfigForm.maxTokens}
                  onChange={handleMaxTokensInputChange}
                  onBlur={handleMaxTokensInputBlur}
                  inputProps={{ min: 1, step: 1 }}
                  sx={{ width: 170 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {t('models.maxTokensInputTip', {
                  defaultValue: `Slider range: 1-${MAX_GENERATION_TOKENS}. You can also input any positive integer.`
                })}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography id="top-p-slider" gutterBottom>
                {t('models.topP', { defaultValue: 'Top P' })}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Slider
                  min={0}
                  max={1}
                  name="topP"
                  value={modelConfigForm.topP}
                  onChange={handleModelFormChange}
                  step={0.1}
                  valueLabelDisplay="auto"
                  aria-label="topP"
                  sx={{ flex: 1 }}
                />
                <Typography variant="body2" sx={{ minWidth: '40px' }}>
                  {modelConfigForm.topP}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModelDialog}>{t('common.cancel')}</Button>
          <Button
            onClick={handleSaveModel}
            variant="contained"
            disabled={!modelConfigForm.providerId || !modelConfigForm.providerName || !modelConfigForm.endpoint}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
