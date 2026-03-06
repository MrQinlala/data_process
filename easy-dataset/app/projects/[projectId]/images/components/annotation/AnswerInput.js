'use client';

import { Box, Typography, TextField, Chip, Button, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import AIGenerateButton from './AIGenerateButton';

export default function AnswerInput({
  answerType,
  answer,
  onAnswerChange,
  labels,
  customFormat,
  projectId,
  imageName,
  question
}) {
  const { t, i18n } = useTranslation();
  const [newLabel, setNewLabel] = useState('');
  const [jsonError, setJsonError] = useState('');

  // 文字类型输入
  if (answerType === 'text') {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
            {t('images.answer', { defaultValue: '文本答案' })} *
          </Typography>
          <AIGenerateButton
            projectId={projectId}
            imageName={imageName}
            question={question}
            onSuccess={onAnswerChange}
          />
        </Box>
        <TextField
          fullWidth
          multiline
          rows={6}
          value={answer}
          onChange={e => onAnswerChange(e.target.value)}
          placeholder={t('images.answerPlaceholder', { defaultValue: '请输入答案...' })}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.paper',
              '& fieldset': {
                borderWidth: 2,
                borderColor: 'divider'
              },
              '&:hover fieldset': {
                borderColor: 'primary.main'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2
              }
            },
            '& textarea': {
              fontSize: '14px',
              lineHeight: 1.6
            }
          }}
        />
      </Box>
    );
  }

  // 标签类型输入 - 提前解析 labels，避免条件中的 hooks 问题
  if (answerType === 'label') {
    const selectedLabels = Array.isArray(answer) ? answer : [];

    // 解析 labels（可能是 JSON 字符串或数组）
    let labelOptions = [];
    if (typeof labels === 'string' && labels) {
      try {
        labelOptions = JSON.parse(labels);
      } catch (e) {
        labelOptions = [];
      }
    } else if (Array.isArray(labels)) {
      labelOptions = labels;
    }

    if (!labelOptions.includes('其他') && !labelOptions.includes('other')) {
      labelOptions.push(i18n.language === 'en' ? 'other' : '其他');
    }

    const handleToggleLabel = label => {
      if (selectedLabels.includes(label)) {
        onAnswerChange(selectedLabels.filter(l => l !== label));
      } else {
        let newLabels = [...selectedLabels, label];
        onAnswerChange(newLabels);
      }
    };

    const handleAddNewLabel = () => {
      if (newLabel.trim() && !labelOptions.includes(newLabel.trim())) {
        handleToggleLabel(newLabel.trim());
        setNewLabel('');
      }
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
            {t('images.selectLabels', { defaultValue: '标签选择' })} *
          </Typography>
          <AIGenerateButton
            projectId={projectId}
            imageName={imageName}
            question={question}
            onSuccess={onAnswerChange}
            answerType={answerType}
          />
        </Box>

        {/* 可选标签 */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            backgroundColor: 'grey.50',
            border: '2px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.light'
            }
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            {t('images.availableLabels', { defaultValue: '可选标签' })}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {labelOptions && labelOptions.length > 0 ? (
              labelOptions.map(label => (
                <Chip
                  key={label}
                  label={label}
                  onClick={() => handleToggleLabel(label)}
                  color={selectedLabels.includes(label) ? 'primary' : 'default'}
                  variant={selectedLabels.includes(label) ? 'filled' : 'outlined'}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    height: 36,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: 2
                    }
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {t('images.noLabelsAvailable', { defaultValue: '暂无可选标签' })}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* 添加新标签 */}
        {/* <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            size="small"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder={t('images.addNewLabel', { defaultValue: '添加新标签...' })}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleAddNewLabel();
              }
            }}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'background.paper',
                '& fieldset': {
                  borderWidth: 2
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main'
                }
              }
            }}
          />
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddNewLabel}
            disabled={!newLabel.trim()}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            {t('common.add', { defaultValue: '添加' })}
          </Button>
        </Box> */}

        {/* 已选择标签 */}
        {/* {selectedLabels.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              {t('images.selectedLabels', { defaultValue: '已选择' })} ({selectedLabels.length})
            </Typography>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                backgroundColor: 'primary.50',
                border: '2px solid',
                borderColor: 'primary.200'
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {selectedLabels.map(label => (
                  <Chip
                    key={label}
                    label={label}
                    onDelete={() => handleToggleLabel(label)}
                    color="primary"
                    sx={{
                      borderRadius: 2,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      height: 36,
                      '& .MuiChip-deleteIcon': {
                        fontSize: '18px',
                        '&:hover': {
                          color: 'error.main'
                        }
                      }
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        )} */}
      </Box>
    );
  }

  // 自定义格式输入
  if (answerType === 'custom_format') {
    const handleJsonChange = value => {
      onAnswerChange(value);
      // 验证 JSON 格式
      if (value.trim()) {
        try {
          JSON.parse(value);
          setJsonError('');
        } catch (e) {
          setJsonError(t('images.invalidJsonFormat', { defaultValue: 'JSON 格式不正确' }));
        }
      } else {
        setJsonError('');
      }
    };

    const handleUseTemplate = () => {
      if (customFormat) {
        try {
          let templateJson;
          if (typeof customFormat === 'string') {
            templateJson = JSON.parse(customFormat);
          } else {
            templateJson = customFormat;
          }
          const formatted = JSON.stringify(templateJson, null, 2);
          onAnswerChange(formatted);
          setJsonError('');
        } catch (e) {
          onAnswerChange('{}');
        }
      }
    };

    if (answer && typeof answer === 'object') {
      answer = JSON.stringify(answer, null, 2);
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
            {t('images.customFormatAnswer', { defaultValue: '自定义格式答案' })} *
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <AIGenerateButton
              projectId={projectId}
              imageName={imageName}
              question={question}
              onSuccess={onAnswerChange}
            />
            {customFormat && (
              <Button
                size="small"
                onClick={handleUseTemplate}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2
                  }
                }}
              >
                {t('images.useTemplate', { defaultValue: '使用模板' })}
              </Button>
            )}
            {/* <Button
              size="small"
              onClick={handleFormatJson}
              variant="outlined"
              disabled={!answer.trim()}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              {t('images.formatJson', { defaultValue: '格式化' })}
            </Button> */}
          </Box>
        </Box>

        {/* 显示格式要求 */}
        {customFormat && (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mb: 3,
              bgcolor: 'grey.50',
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              {t('images.formatRequirement', { defaultValue: '格式要求' })}
            </Typography>
            <Box
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: '13px',
                  overflow: 'auto',
                  maxHeight: '150px',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  lineHeight: 1.5,
                  color: '#2d3748'
                }}
              >
                {typeof customFormat === 'string' ? customFormat : JSON.stringify(customFormat, null, 2)}
              </pre>
            </Box>
          </Paper>
        )}

        {/* JSON 输入框 */}
        <TextField
          fullWidth
          multiline
          rows={10}
          value={answer}
          onChange={e => handleJsonChange(e.target.value)}
          placeholder={t('images.customFormatPlaceholder', { defaultValue: '请输入符合格式的 JSON...' })}
          error={!!jsonError}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.paper',
              '& fieldset': {
                borderWidth: 2
              },
              '&:hover fieldset': {
                borderColor: 'primary.main'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2
              },
              '&.Mui-error fieldset': {
                borderColor: 'error.main',
                borderWidth: 2
              }
            },
            '& textarea': {
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '13px',
              lineHeight: 1.5
            },
            '& .MuiFormHelperText-root': {
              fontSize: '0.875rem',
              fontWeight: 500
            }
          }}
        />
      </Box>
    );
  }

  return null;
}
