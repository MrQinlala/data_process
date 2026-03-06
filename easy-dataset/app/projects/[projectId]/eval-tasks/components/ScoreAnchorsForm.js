'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestoreIcon from '@mui/icons-material/Restore';
import { useTranslation } from 'react-i18next';
import { getDefaultScoreAnchors } from '@/lib/llm/prompts/llmJudge';

/**
 * 评分规则表单组件
 * 用于自定义简答题和开放题的评分规则
 */
export default function ScoreAnchorsForm({
  questionType, // 'short_answer' 或 'open_ended'
  scoreAnchors,
  onChange,
  language = 'zh-CN'
}) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  // 获取当前语言
  const currentLanguage = i18n.language === 'zh-CN' ? 'zh-CN' : 'en';

  // 初始化评分规则（如果为空）
  useEffect(() => {
    if (!scoreAnchors || scoreAnchors.length === 0) {
      onChange(getDefaultScoreAnchors(questionType, currentLanguage));
    }
  }, [questionType, currentLanguage]);

  // 处理单个规则的描述更改
  const handleDescriptionChange = (index, newDescription) => {
    const newAnchors = [...scoreAnchors];
    newAnchors[index] = { ...newAnchors[index], description: newDescription };
    onChange(newAnchors);
  };

  // 恢复默认值
  const handleRestore = () => {
    onChange(getDefaultScoreAnchors(questionType, currentLanguage));
  };

  // 获取题型显示名称
  const getQuestionTypeName = () => {
    if (questionType === 'short_answer') {
      return t('evalTasks.shortAnswer', '简答题');
    }
    return t('evalTasks.openEnded', '开放题');
  };

  // 获取分数区间的颜色
  const getScoreColor = range => {
    if (range === '1.0') return 'success';
    if (range.includes('0.8') || range.includes('0.9')) return 'info';
    if (range.includes('0.6') || range.includes('0.7')) return 'warning';
    return 'error';
  };

  if (!scoreAnchors || scoreAnchors.length === 0) {
    return null;
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={(e, isExpanded) => setExpanded(isExpanded)}
      sx={{
        mb: 2,
        '&:before': { display: 'none' },
        boxShadow: 1
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: 'action.hover',
          '&:hover': { bgcolor: 'action.selected' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {t('evalTasks.scoreAnchorsTitle', '{{type}}评分规则', { type: getQuestionTypeName() })}
          </Typography>
          <Chip label={t('evalTasks.customizable', '可自定义')} size="small" color="primary" variant="outlined" />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('evalTasks.scoreAnchorsHint', '自定义评分标准，用于指导LLM评估模型的回答质量')}
          </Typography>
          <Tooltip title={t('evalTasks.restoreDefault', '恢复默认')}>
            <IconButton size="small" onClick={handleRestore} color="primary">
              <RestoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {scoreAnchors.map((anchor, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip
                label={anchor.range}
                size="small"
                color={getScoreColor(anchor.range)}
                sx={{ minWidth: 70, fontWeight: 600 }}
              />
              <Typography variant="caption" color="text.secondary">
                {t('evalTasks.scoreRange', '分数区间')}
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              value={anchor.description}
              onChange={e => handleDescriptionChange(index, e.target.value)}
              placeholder={t('evalTasks.scoreDescriptionPlaceholder', '请输入该分数区间的评分标准描述...')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}
