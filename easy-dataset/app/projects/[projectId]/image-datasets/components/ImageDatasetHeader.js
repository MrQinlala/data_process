'use client';

import { Box, Button, Divider, Typography, IconButton, CircularProgress, Paper } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

/**
 * 图片数据集详情页面的头部导航组件
 */
export default function ImageDatasetHeader({
  projectId,
  datasetsAllCount,
  datasetsConfirmCount,
  confirming,
  unconfirming,
  currentDataset,
  onNavigate,
  onConfirm,
  onUnconfirm,
  onDelete
}) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* 左侧：返回按钮和统计信息 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<NavigateBeforeIcon />}
            onClick={() => router.push(`/projects/${projectId}/image-datasets`)}
          >
            {t('imageDatasets.title', '图片数据集')}
          </Button>
          <Divider orientation="vertical" flexItem />
          <Typography variant="body2" color="text.secondary">
            共 {datasetsAllCount} 个数据集，已确认 {datasetsConfirmCount} 个 (
            {datasetsAllCount > 0 ? ((datasetsConfirmCount / datasetsAllCount) * 100).toFixed(2) : 0}%)
          </Typography>
        </Box>

        {/* 右侧：翻页、确认/取消确认、删除按钮 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => onNavigate('prev')}>
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton onClick={() => onNavigate('next')}>
            <NavigateNextIcon />
          </IconButton>
          <Divider orientation="vertical" flexItem />

          {/* 确认/取消确认按钮 */}
          {currentDataset?.confirmed ? (
            <Button
              variant="outlined"
              color="warning"
              disabled={unconfirming}
              onClick={onUnconfirm}
              startIcon={unconfirming ? <CircularProgress size={16} /> : <UndoIcon />}
              sx={{ mr: 1 }}
            >
              {unconfirming ? t('common.unconfirming', '取消中...') : t('datasets.unconfirm', '取消确认')}
            </Button>
          ) : (
            <Button variant="contained" color="primary" disabled={confirming} onClick={onConfirm} sx={{ mr: 1 }}>
              {confirming ? <CircularProgress size={24} /> : t('datasets.confirmSave', '确认保留')}
            </Button>
          )}

          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
            {t('common.delete', '删除')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
