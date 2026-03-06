'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Avatar,
  Grid,
  Tooltip,
  Divider
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import StopIcon from '@mui/icons-material/Stop';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';

const STATUS_MAP = {
  0: { label: 'blindTest.statusProcessing', color: 'primary', bgColor: 'primary.main' },
  1: { label: 'blindTest.statusCompleted', color: 'success', bgColor: 'success.main' },
  2: { label: 'blindTest.statusFailed', color: 'error', bgColor: 'error.main' },
  3: { label: 'blindTest.statusInterrupted', color: 'warning', bgColor: 'warning.main' }
};

export default function BlindTestTaskCard({ task, onView, onDelete, onInterrupt, onContinue }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = e => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = e => {
    e?.stopPropagation?.();
    handleMenuClose();
    onView?.(task);
  };

  const handleDelete = e => {
    e?.stopPropagation?.();
    handleMenuClose();
    onDelete?.(task);
  };

  const handleInterrupt = e => {
    e?.stopPropagation?.();
    handleMenuClose();
    onInterrupt?.(task);
  };

  const handleContinue = e => {
    e?.stopPropagation?.();
    handleMenuClose();
    onContinue?.(task);
  };

  const statusConfig = STATUS_MAP[task.status] || STATUS_MAP[0];
  const progress = task.totalCount > 0 ? (task.completedCount / task.totalCount) * 100 : 0;
  const isProcessing = task.status === 0;
  const isCompleted = task.status === 1;

  // 计算模型得分
  const results = task.detail?.results || [];
  const modelAScore = results.reduce((sum, r) => sum + (r.modelAScore || 0), 0);
  const modelBScore = results.reduce((sum, r) => sum + (r.modelBScore || 0), 0);
  const totalScore = modelAScore + modelBScore;

  // Calculate win percentages for visual bar
  const modelAPercent = totalScore > 0 ? (modelAScore / totalScore) * 100 : 50;
  const modelBPercent = totalScore > 0 ? (modelBScore / totalScore) * 100 : 50;

  const winner = isCompleted ? (modelAScore > modelBScore ? 'A' : modelBScore > modelAScore ? 'B' : 'Tie') : null;

  return (
    <Card
      sx={{
        width: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px -4px ${alpha(theme.palette.primary.main, 0.1)}`,
          borderColor: 'primary.main'
        }
      }}
      onClick={e => handleView(e)}
    >
      <CardContent sx={{ p: '20px !important' }}>
        <Grid container alignItems="center" spacing={3}>
          {/* Status & Time */}
          <Grid item xs={12} md={2} lg={1.5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Chip
                label={t(statusConfig.label)}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette[statusConfig.color].main, 0.1),
                  color: `${statusConfig.color}.main`,
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: alpha(theme.palette[statusConfig.color].main, 0.2),
                  width: 'fit-content'
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                <AccessTimeIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" noWrap>
                  {new Date(task.createAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Model Comparison Area */}
          <Grid item xs={12} md={9} lg={9.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              {/* Model A */}
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                    boxShadow:
                      winner === 'A'
                        ? `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.primary.main}`
                        : 'none'
                  }}
                >
                  A
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Tooltip title={task.modelInfo?.modelA?.modelName}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                      {task.modelInfo?.modelA?.modelName || 'Model A'}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {task.modelInfo?.modelA?.providerName}
                  </Typography>
                </Box>
                {isCompleted && winner === 'A' && <EmojiEventsIcon color="primary" />}
              </Box>

              {/* Center Status/Score */}
              <Box
                sx={{
                  width: 140,
                  textAlign: 'center',
                  px: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isCompleted ? (
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, lineHeight: 1 }}>
                      <span style={{ color: theme.palette.primary.main }}>{modelAScore.toFixed(1)}</span>
                      <span style={{ color: theme.palette.text.disabled, margin: '0 4px', fontSize: '0.8em' }}>:</span>
                      <span style={{ color: theme.palette.secondary.main }}>{modelBScore.toFixed(1)}</span>
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        height: 4,
                        borderRadius: 2,
                        overflow: 'hidden',
                        mt: 1,
                        width: '100%',
                        bgcolor: 'grey.100'
                      }}
                    >
                      <Box sx={{ width: `${modelAPercent}%`, bgcolor: 'primary.main' }} />
                      <Box sx={{ width: `${modelBPercent}%`, bgcolor: 'secondary.main' }} />
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%' }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="bold"
                      sx={{ mb: 0.5, display: 'block' }}
                    >
                      VS
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover' }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}
                    >
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Model B */}
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  minWidth: 0,
                  flexDirection: 'row-reverse'
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'secondary.main',
                    fontSize: '1rem',
                    boxShadow:
                      winner === 'B'
                        ? `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.secondary.main}`
                        : 'none'
                  }}
                >
                  B
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                  <Tooltip title={task.modelInfo?.modelB?.modelName}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                      {task.modelInfo?.modelB?.modelName || 'Model B'}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {task.modelInfo?.modelB?.providerName}
                  </Typography>
                </Box>
                {isCompleted && winner === 'B' && <EmojiEventsIcon color="secondary" />}
              </Box>
            </Box>
          </Grid>

          {/* Menu */}
          <Grid item xs={12} md={1} lg={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton size="small" onClick={handleMenuOpen} sx={{ color: 'text.secondary' }}>
              <MoreVertIcon />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>

      {/* 菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 2,
          sx: {
            mt: 1,
            minWidth: 160,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <MenuItem onClick={handleView} sx={{ gap: 1.5, py: 1 }}>
          <VisibilityIcon fontSize="small" color="action" />
          <Typography variant="body2">{t('blindTest.viewDetails', '查看详情')}</Typography>
        </MenuItem>
        {isProcessing && (
          <MenuItem onClick={handleContinue} sx={{ gap: 1.5, py: 1 }}>
            <PlayArrowIcon fontSize="small" color="primary" />
            <Typography variant="body2">{t('blindTest.continue', '继续盲测')}</Typography>
          </MenuItem>
        )}
        {isProcessing && (
          <MenuItem onClick={handleInterrupt} sx={{ gap: 1.5, py: 1 }}>
            <StopIcon fontSize="small" color="warning" />
            <Typography variant="body2">{t('blindTest.interrupt', '中断任务')}</Typography>
          </MenuItem>
        )}
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleDelete} sx={{ gap: 1.5, py: 1, color: 'error.main' }}>
          <DeleteIcon fontSize="small" />
          <Typography variant="body2">{t('common.delete', '删除')}</Typography>
        </MenuItem>
      </Menu>
    </Card>
  );
}
