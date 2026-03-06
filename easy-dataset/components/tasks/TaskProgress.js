'use client';

import React from 'react';
import { Stack, LinearProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// 任务进度组件
export default function TaskProgress({ task }) {
  const { t } = useTranslation();

  // 如果没有总数，则不显示进度条
  if (task.totalCount === 0) return '-';

  // 计算进度百分比
  const progress = (task.completedCount / task.totalCount) * 100;

  return (
    <Stack direction="column" spacing={0.5}>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 3,
          width: 120,
          '& .MuiLinearProgress-bar': {
            transition: 'transform 0.5s ease'
          }
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {task.completedCount} / {task.totalCount} ({Math.round(progress)}%)
      </Typography>
    </Stack>
  );
}
