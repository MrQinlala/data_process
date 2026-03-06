'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Avatar,
  useTheme
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import StopIcon from '@mui/icons-material/Stop';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import QuizIcon from '@mui/icons-material/Quiz';
import { useTranslation } from 'react-i18next';
import { getModelIcon } from '@/lib/util/modelIcon';
import styles from '../styles';

const STATUS_CONFIG = {
  0: { label: 'evalTasks.statusProcessing', color: 'info', icon: HourglassEmptyIcon },
  1: { label: 'evalTasks.statusCompleted', color: 'success', icon: CheckCircleIcon },
  2: { label: 'evalTasks.statusFailed', color: 'error', icon: ErrorIcon },
  3: { label: 'evalTasks.statusInterrupted', color: 'warning', icon: PauseCircleIcon }
};

export default function EvalTaskCard({ task, onView, onDelete, onInterrupt }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { modelInfo, detail, status, completedCount, totalCount, createAt } = task;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG[0];
  const StatusIcon = statusConfig.icon;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const finalScore = detail?.finalScore;

  const handleMenuClick = e => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleAction = action => () => {
    handleMenuClose();
    action?.(task);
  };

  const getScoreColor = score => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

  return (
    <Card sx={styles.taskCard(theme)} onClick={handleAction(onView)}>
      <CardContent sx={styles.taskCardContent}>
        {/* 头部 */}
        <Box sx={styles.taskCardHeader}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, overflow: 'hidden' }}>
            <Avatar sx={{ bgcolor: 'transparent', width: 40, height: 40, border: '1px solid', borderColor: 'divider' }}>
              <img
                src={getModelIcon(modelInfo?.modelName || modelInfo?.modelId)}
                alt={modelInfo?.modelId || 'model'}
                style={{ width: 28, height: 28, objectFit: 'contain' }}
              />
            </Avatar>
            <Box sx={styles.taskCardModel}>
              <Typography sx={styles.taskCardModelName} noWrap>
                {modelInfo?.modelName || modelInfo?.modelId}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {modelInfo?.providerName || modelInfo?.providerId}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* 状态和得分 */}
        <Box sx={styles.taskCardStatus}>
          <Chip
            icon={<StatusIcon sx={{ fontSize: 14 }} />}
            label={t(statusConfig.label)}
            color={statusConfig.color}
            size="small"
            variant="outlined"
            sx={{ height: 24, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
          />
          {finalScore !== undefined && status === 1 && (
            <Chip
              label={`${finalScore.toFixed(1)}%`}
              color={getScoreColor(finalScore)}
              size="small"
              sx={{ height: 24, fontWeight: 600, '& .MuiChip-label': { px: 1 } }}
            />
          )}
        </Box>

        {/* 进度条 */}
        {status === 0 && (
          <Box sx={styles.taskCardProgress}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {t('evalTasks.progress')}
              </Typography>
              <Typography variant="caption" color="primary" fontWeight={600}>
                {completedCount}/{totalCount}
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={styles.progressBar} />
          </Box>
        )}

        {/* 统计信息 */}
        <Box sx={styles.taskCardStats}>
          <Chip
            icon={<QuizIcon sx={{ fontSize: 14 }} />}
            label={`${totalCount} ${t('evalTasks.questions')}`}
            size="small"
            variant="outlined"
            sx={{ height: 22, '& .MuiChip-label': { px: 0.75, fontSize: '0.7rem' } }}
          />
          {detail?.hasSubjectiveQuestions && (
            <Chip
              label={t('evalTasks.hasSubjective')}
              size="small"
              color="info"
              variant="outlined"
              sx={{ height: 22, '& .MuiChip-label': { px: 0.75, fontSize: '0.7rem' } }}
            />
          )}
        </Box>

        {/* 时间 */}
        <Typography sx={{ ...styles.taskCardTime, mt: 1.5 }} color="text.disabled">
          {new Date(createAt).toLocaleString()}
        </Typography>
      </CardContent>

      {/* 菜单 */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} onClick={e => e.stopPropagation()}>
        <MenuItem onClick={handleAction(onView)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          {t('datasets.viewDetails')}
        </MenuItem>
        {status === 0 && (
          <MenuItem onClick={handleAction(onInterrupt)}>
            <ListItemIcon>
              <StopIcon fontSize="small" color="warning" />
            </ListItemIcon>
            {t('evalTasks.interrupt')}
          </MenuItem>
        )}
        <MenuItem onClick={handleAction(onDelete)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          {t('common.delete')}
        </MenuItem>
      </Menu>
    </Card>
  );
}
