'use client';

import { Box, Paper, Typography, Chip, Grid, Divider } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { detailStyles } from '../detailStyles';
import { useTranslation } from 'react-i18next';
import { getModelIcon } from '@/lib/util/modelIcon';

export default function EvalHeader({ task, stats, filterCorrect, onFilterCorrectSelect }) {
  const { t } = useTranslation();

  if (!task) return null;

  const { modelInfo, createAt, status, detail } = task;
  const score = detail?.finalScore || 0;
  const isPass = score >= 60;
  const totalTime = task.endTime ? Math.floor((new Date(task.endTime) - new Date(task.createAt)) / 1000) : 0;

  const incorrectCount = (stats?.totalQuestions || 0) - (stats?.correctCount || 0);

  // 获取教师模型信息
  const judgeModelId = detail?.judgeModelId;
  const judgeProviderId = detail?.judgeProviderId;
  const hasJudgeModel = judgeModelId && judgeProviderId;

  return (
    <Paper sx={detailStyles.headerCard}>
      <Box sx={detailStyles.headerContent}>
        {/* 左侧：模型信息 */}
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              bgcolor: 'transparent',
              border: '2px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={getModelIcon(modelInfo?.modelName || modelInfo?.modelId)}
              alt={modelInfo?.modelId || 'model'}
              style={{ width: 44, height: 44, objectFit: 'contain' }}
            />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {modelInfo?.providerName || modelInfo?.providerId} / {modelInfo?.modelName || modelInfo?.modelId}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', flexWrap: 'wrap' }}>
              {hasJudgeModel && (
                <Chip
                  label={`${t('evalTasks.judgeModel')}: ${judgeProviderId} / ${judgeModelId}`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{ borderRadius: 1 }}
                />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                {new Date(createAt).toLocaleString()}
                {totalTime > 0 && ` ${t('evalTasks.durationFormat', { time: totalTime })}`}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 中间：统计概览 (增加点击筛选) */}
        <Box sx={{ display: 'flex', gap: 2, mx: 4 }}>
          <Box
            onClick={() => onFilterCorrectSelect(null)}
            sx={{
              ...detailStyles.statBox,
              cursor: 'pointer',
              bgcolor: filterCorrect === null ? 'rgba(25, 118, 210, 0.08)' : 'background.default',
              border: filterCorrect === null ? '1px solid' : '1px solid transparent',
              borderColor: 'primary.main',
              transition: 'all 0.2s'
            }}
          >
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {stats?.totalQuestions || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('evalTasks.totalQuestionsLabel')}
            </Typography>
          </Box>
          <Box
            onClick={() => onFilterCorrectSelect(true)}
            sx={{
              ...detailStyles.statBox,
              cursor: 'pointer',
              bgcolor: filterCorrect === true ? 'rgba(46, 125, 50, 0.08)' : 'background.default',
              border: filterCorrect === true ? '1px solid' : '1px solid transparent',
              borderColor: 'success.main',
              transition: 'all 0.2s'
            }}
          >
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {stats?.correctCount || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('evalTasks.correctLabel')}
            </Typography>
          </Box>
          <Box
            onClick={() => onFilterCorrectSelect(false)}
            sx={{
              ...detailStyles.statBox,
              cursor: 'pointer',
              bgcolor: filterCorrect === false ? 'rgba(211, 47, 47, 0.08)' : 'background.default',
              border: filterCorrect === false ? '1px solid' : '1px solid transparent',
              borderColor: 'error.main',
              transition: 'all 0.2s'
            }}
          >
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {incorrectCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('evalTasks.incorrectLabel')}
            </Typography>
          </Box>
        </Box>

        {/* 右侧：分数印章 */}
        <Box sx={detailStyles.scoreStamp(score, isPass)}>
          <Typography sx={detailStyles.scoreValue}>{score.toFixed(1)}</Typography>
          <Typography sx={detailStyles.scoreLabel}>SCORE</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
