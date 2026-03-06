'use client';

import { Autocomplete, TextField, Box, Typography, Chip, Button, Dialog } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function QuestionSelector({
  templates,
  selectedTemplate,
  onTemplateChange,
  answeredQuestions = [],
  unansweredQuestions = [],
  onOpenCreateQuestion,
  onOpenCreateTemplate
}) {
  const { t } = useTranslation();
  const [showNoQuestionsMessage, setShowNoQuestionsMessage] = useState(false);

  // 构建未完成标注的问题选项（用于下拉框）
  const dropdownOptions = unansweredQuestions.map(q => ({
    ...q,
    isUnanswered: true
  }));

  const getAnswerTypeLabel = answerType => {
    switch (answerType) {
      case 'text':
        return t('images.answerTypeText', { defaultValue: '文字' });
      case 'label':
        return t('images.answerTypeLabel', { defaultValue: '标签' });
      case 'custom_format':
        return t('images.answerTypeCustomFormat', { defaultValue: '自定义格式' });
      default:
        return answerType;
    }
  };

  // 判断是否有待标注问题
  const hasUnansweredQuestions = unansweredQuestions.length > 0;
  const hasAnsweredQuestions = answeredQuestions.length > 0;
  const hasAnyQuestions = hasUnansweredQuestions || hasAnsweredQuestions;

  return (
    <Box>
      {/* 已标注问题区域 - 优化显示为一行，添加最大高度 */}
      {answeredQuestions.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mb: 1.5, color: 'text.secondary' }}>
            {t('images.answeredQuestions', { defaultValue: '已标注问题' })} ({answeredQuestions.length})
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              maxHeight: 120,
              overflowY: 'auto',
              paddingRight: 1,
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'action.disabled',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.active'
                }
              }
            }}
          >
            {answeredQuestions.map(question => (
              <Chip
                key={question.id}
                label={question.question}
                size="small"
                color="success"
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  maxWidth: '100%',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* 问题选择下拉框 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
          {t('images.selectNewQuestion', { defaultValue: '选择新问题' })}
        </Typography>

        {!hasUnansweredQuestions ? (
          // 没有待标注问题的提示
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'background.paper',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              mb: 2
            }}
          >
            {hasAnsweredQuestions ? (
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {t('images.allQuestionsAnnotated', { defaultValue: '当前图片所有问题已标注完成' })}
              </Typography>
            ) : (
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {t('images.noQuestionsAssociated', { defaultValue: '当前图片未关联任何问题' })}
              </Typography>
            )}
          </Box>
        ) : (
          // 有待标注问题时显示下拉框
          <Autocomplete
            fullWidth
            options={dropdownOptions}
            value={selectedTemplate}
            onChange={(event, newValue) => {
              if (newValue) {
                onTemplateChange(newValue);
              }
            }}
            getOptionLabel={option => option.question || ''}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{
                  py: 1.5,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="500">
                    {option.question}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip label={getAnswerTypeLabel(option.answerType)} size="small" sx={{ borderRadius: 1 }} />
                    <Chip
                      label={t('images.pendingAnswer', { defaultValue: '待标注' })}
                      size="small"
                      color="warning"
                      variant="filled"
                      sx={{ borderRadius: 1, fontSize: '0.75rem' }}
                    />
                  </Box>
                </Box>
              </Box>
            )}
            renderInput={params => (
              <TextField
                {...params}
                placeholder={t('images.selectQuestionPlaceholder', { defaultValue: '请选择问题进行标注...' })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        )}

        {selectedTemplate && selectedTemplate.description && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {selectedTemplate.description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
