'use client';

import { Box, Typography } from '@mui/material';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import { useTranslation } from 'react-i18next';
import { imageDatasetStyles } from '../styles/imageDatasetStyles';

export default function EmptyState() {
  const { t } = useTranslation();

  return (
    <Box sx={imageDatasetStyles.emptyState}>
      <Box sx={imageDatasetStyles.emptyIcon}>
        <ImageSearchIcon sx={{ fontSize: 60, color: 'primary.main' }} />
      </Box>
      <Typography variant="h5" sx={imageDatasetStyles.emptyTitle}>
        {t('imageDatasets.noData', { defaultValue: '暂无图片数据集' })}
      </Typography>
      <Typography variant="body2" sx={imageDatasetStyles.emptyDescription}>
        {t('imageDatasets.noDataTip', { defaultValue: '请先在图片管理中生成问答数据集' })}
      </Typography>
    </Box>
  );
}
