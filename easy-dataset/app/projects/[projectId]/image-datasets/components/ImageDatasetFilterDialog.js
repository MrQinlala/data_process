'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Select,
  MenuItem,
  Slider,
  TextField,
  Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function ImageDatasetFilterDialog({
  open,
  onClose,
  statusFilter,
  scoreFilter,
  onStatusChange,
  onScoreChange,
  onResetFilters,
  onApplyFilters
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('datasets.filtersTitle', '筛选条件')}</DialogTitle>
      <DialogContent>
        {/* 确认状态筛选 */}
        <Box sx={{ mb: 3, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            {t('imageDatasets.status', { defaultValue: '确认状态' })}
          </Typography>
          <Select
            value={statusFilter}
            onChange={e => onStatusChange(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            <MenuItem value="all">{t('common.all', '全部')}</MenuItem>
            <MenuItem value="confirmed">{t('imageDatasets.confirmed', { defaultValue: '已确认' })}</MenuItem>
            <MenuItem value="unconfirmed">{t('imageDatasets.unconfirmed', { defaultValue: '未确认' })}</MenuItem>
          </Select>
        </Box>

        {/* 评分范围筛选 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            {t('imageDatasets.scoreRange', { defaultValue: '评分范围' })}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {scoreFilter[0]} - {scoreFilter[1]} 分
          </Typography>
          <Slider
            value={scoreFilter}
            onChange={(e, newValue) => onScoreChange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={5}
            step={1}
            marks
            sx={{ mt: 1 }}
          />
        </Box>
      </DialogContent>

      {/* 对话框操作按钮 */}
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onResetFilters} variant="outlined">
          {t('common.reset', '重置')}
        </Button>
        <Button onClick={onClose} variant="outlined">
          {t('common.cancel', '取消')}
        </Button>
        <Button onClick={onApplyFilters} variant="contained">
          {t('common.apply', '应用')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
