'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { FormControl, Select, MenuItem, useTheme, ListSubheader, Box, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai/index';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/lib/store';
import axios from 'axios';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { getModelIcon } from '@/lib/util/modelIcon';

export default function ModelSelect({
  size = 'small',
  minWidth = 50,
  projectId,
  minHeight = 36,
  required = false,
  onError
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const models = useAtomValue(modelConfigListAtom);
  const [selectedModelInfo, setSelectedModelInfo] = useAtom(selectedModelInfoAtom);
  const [selectedModel, setSelectedModel] = useState(() => {
    if (selectedModelInfo && selectedModelInfo.id) {
      return selectedModelInfo.id;
    }
    return '';
  });
  const [error, setError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleModelChange = event => {
    if (!event || !event.target) return;
    const newModelId = event.target.value;

    if (error) {
      setError(false);
      if (onError) onError(false);
    }

    if (!newModelId) {
      setSelectedModel('');
      setSelectedModelInfo(null);
      updateDefaultModel(null);
    } else {
      const selectedModelObj = models.find(model => model.id === newModelId);
      if (selectedModelObj) {
        setSelectedModel(newModelId);
        setSelectedModelInfo(selectedModelObj);
        updateDefaultModel(newModelId);
      } else {
        setSelectedModel(newModelId);
        setSelectedModelInfo({ id: newModelId });
      }
    }

    setTimeout(() => {
      setIsHovered(false);
      setIsOpen(false);
    }, 200);
  };

  const updateDefaultModel = async id => {
    const res = await axios.put(`/api/projects/${projectId}`, { projectId, defaultModelConfigId: id });
    if (res.status === 200) {
      console.log('更新成功');
    }
  };

  const validateModel = () => {
    if (required && (!selectedModel || selectedModel === '')) {
      setError(true);
      if (onError) onError(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (selectedModelInfo && selectedModelInfo.id) {
      setSelectedModel(selectedModelInfo.id);
    } else {
      setSelectedModel('');
    }
  }, [selectedModelInfo]);

  useEffect(() => {
    if (required) {
      validateModel();
    }
  }, [required]);

  const renderSelectedValue = value => {
    if (!value) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon fontSize="small" />
          {t('models.unselectedModel', t('playground.selectModelFirst'))}
        </Box>
      );
    }

    const selectedModelObj = models.find(model => model.id === value);
    if (!selectedModelObj) return null;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          component="img"
          src={getModelIcon(selectedModelObj.modelName || selectedModelObj.modelId)}
          alt={selectedModelObj.modelName}
          sx={{
            width: 20,
            height: 20,
            objectFit: 'contain',
            flexShrink: 0,
            background: '#ffffffc9',
            borderRadius: '50%',
            marginBottom: '-2px'
          }}
          onError={e => {
            e.target.src = '/imgs/models/default.svg';
          }}
        />
        {selectedModelObj.modelName}
      </Box>
    );
  };

  const currentModelIcon = useMemo(() => {
    const selectedModelObj = models.find(model => model.id === selectedModel);
    return selectedModelObj ? getModelIcon(selectedModelObj.modelName, selectedModelObj.modelId) : null;
  }, [selectedModel, models]);

  const shouldShowFullSelect = isHovered || isOpen;

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isOpen) {
          setIsOpen(false);
        }
      }}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {!shouldShowFullSelect && (
        <Tooltip
          title={
            selectedModel
              ? models.find(m => m.id === selectedModel)?.modelName
              : t('playground.selectModelFirst', '请先选择模型')
          }
          placement="bottom"
        >
          <IconButton
            size="medium"
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.69)',
              color: theme.palette.mode === 'dark' ? 'inherit' : 'white',
              borderRadius: 1.5,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.35)'
              },
              ...(error && {
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 1
                  },
                  '50%': {
                    opacity: 0.5
                  }
                }
              })
            }}
          >
            {currentModelIcon ? (
              <Box
                component="img"
                src={currentModelIcon}
                alt="model icon"
                sx={{
                  width: 20,
                  height: 20,
                  objectFit: 'contain'
                }}
                onError={e => {
                  e.target.src = '/imgs/models/default.svg';
                }}
              />
            ) : (
              <SmartToyIcon
                fontSize="small"
                color="red"
                sx={{
                  color: error ? 'red' : 'red'
                }}
              />
            )}
          </IconButton>
        </Tooltip>
      )}

      <FormControl
        size={size}
        sx={{
          minWidth: shouldShowFullSelect ? 200 : 0,
          minHeight,
          opacity: shouldShowFullSelect ? 1 : 0,
          width: shouldShowFullSelect ? 'auto' : 0,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: shouldShowFullSelect ? 'relative' : 'absolute',
          pointerEvents: shouldShowFullSelect ? 'auto' : 'none'
        }}
        error={error}
      >
        <Select
          value={selectedModel}
          onChange={handleModelChange}
          displayEmpty
          variant="outlined"
          onBlur={validateModel}
          renderValue={renderSelectedValue}
          onOpen={() => setIsOpen(true)}
          onClose={() => setIsOpen(false)}
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)',
            color: theme.palette.mode === 'dark' ? 'inherit' : 'white',
            borderRadius: 1.5,
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              padding: '6px 32px 6px 12px'
            },
            '& .MuiSelect-icon': {
              color: theme.palette.mode === 'dark' ? 'inherit' : 'white',
              right: '8px'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.mode === 'dark' ? 'primary.main' : 'rgba(255, 255, 255, 0.5)'
            },
            minHeight: '36px'
          }}
          MenuProps={{
            PaperProps: {
              elevation: 2,
              sx: {
                mt: 1,
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  minHeight: '30px'
                }
              }
            }
          }}
        >
          <MenuItem value="">
            {error ? t('models.pleaseSelectModel') : t('models.unselectedModel', t('playground.selectModelFirst'))}
          </MenuItem>
          {(() => {
            const filteredModels = models.filter(m => {
              if (m.providerId?.toLowerCase() === 'ollama') {
                return m.modelName && m.endpoint;
              } else {
                return m.modelName && m.endpoint && m.apiKey;
              }
            });

            const providers = [...new Set(filteredModels.map(m => m.providerName || 'Other'))];

            return providers.map(provider => {
              const providerModels = filteredModels.filter(m => (m.providerName || 'Other') === provider);
              return [
                <ListSubheader
                  key={`header-${provider}`}
                  sx={{
                    pl: 2,
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    mt: 1,
                    mb: 0.5
                  }}
                >
                  {provider || 'Other'}
                </ListSubheader>,
                ...providerModels.map(model => (
                  <MenuItem
                    key={model.id}
                    value={model.id}
                    sx={{
                      pl: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      minHeight: '30px',
                      '&.Mui-selected': {
                        bgcolor: theme.palette.action.selected,
                        '&:hover': {
                          bgcolor: theme.palette.action.selected
                        }
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={getModelIcon(model.modelName || model.modelId)}
                      alt={model.modelName}
                      sx={{
                        width: 20,
                        height: 20,
                        objectFit: 'contain',
                        flexShrink: 0
                      }}
                      onError={e => {
                        e.target.src = '/imgs/models/default.svg';
                      }}
                    />
                    <Box component="span" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {model.modelName}
                    </Box>
                  </MenuItem>
                ))
              ];
            });
          })()}
        </Select>
      </FormControl>
    </Box>
  );
}
