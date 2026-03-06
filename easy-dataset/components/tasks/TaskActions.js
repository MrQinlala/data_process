'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { useTranslation } from 'react-i18next';

// 任务操作组件
export default function TaskActions({ task, onAbort, onDelete }) {
  const { t } = useTranslation();

  // 处理中的任务显示中断按钮，其他状态显示删除按钮
  return task.status === 0 ? (
    <Tooltip title={t('tasks.actions.abort')} arrow>
      <IconButton size="small" onClick={() => onAbort(task.id)}>
        <StopCircleIcon fontSize="small" color="warning" />
      </IconButton>
    </Tooltip>
  ) : (
    <Tooltip title={t('tasks.actions.delete')} arrow>
      <IconButton size="small" onClick={() => onDelete(task.id)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
