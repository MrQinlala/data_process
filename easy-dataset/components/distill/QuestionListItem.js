'use client';

import { useState } from 'react';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ChatIcon from '@mui/icons-material/Chat';
import { useTranslation } from 'react-i18next';

/**
 * 问题列表项组件
 * @param {Object} props
 * @param {Object} props.question - 问题对象
 * @param {number} props.level - 缩进级别
 * @param {Function} props.onDelete - 删除问题的回调
 * @param {Function} props.onGenerateDataset - 生成数据集的回调
 * @param {Function} props.onGenerateMultiTurnDataset - 生成多轮对话数据集的回调
 * @param {boolean} props.processing - 是否正在处理
 * @param {boolean} props.processingMultiTurn - 是否正在生成多轮对话
 */
export default function QuestionListItem({
  question,
  level,
  onDelete,
  onGenerateDataset,
  onGenerateMultiTurnDataset,
  processing = false,
  processingMultiTurn = false
}) {
  const { t } = useTranslation();

  return (
    <ListItem
      sx={{
        pl: (level + 1) * 2,
        py: 0.75,
        borderLeft: '1px dashed rgba(0, 0, 0, 0.1)',
        ml: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
      secondaryAction={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={t('datasets.generateDataset')}>
            <IconButton
              size="small"
              color="primary"
              onClick={e => onGenerateDataset(e)}
              disabled={processing || processingMultiTurn}
            >
              {processing ? <CircularProgress size={16} /> : <AutoFixHighIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={t('questions.generateMultiTurnDataset', { defaultValue: '生成多轮对话数据集' })}>
            <IconButton
              size="small"
              color="secondary"
              onClick={e => onGenerateMultiTurnDataset && onGenerateMultiTurnDataset(e)}
              disabled={processing || processingMultiTurn || !onGenerateMultiTurnDataset}
            >
              {processingMultiTurn ? <CircularProgress size={16} /> : <ChatIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <IconButton
              size="small"
              color="error"
              onClick={e => onDelete(e)}
              disabled={processing || processingMultiTurn}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <ListItemIcon sx={{ minWidth: 32, color: 'secondary.main' }}>
        <HelpOutlineIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                paddingRight: '28px' // 留出删除按钮的空间
              }}
            >
              {question.question}
            </Typography>
            {question.answered && (
              <Chip
                size="small"
                label={t('datasets.answered')}
                color="success"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        }
      />
    </ListItem>
  );
}
