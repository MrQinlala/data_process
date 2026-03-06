'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, LinearProgress, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ExportProgressDialog = ({ open, progress }) => {
  const { t } = useTranslation();

  const { processed, total, hasMore } = progress;

  // 计算进度百分比
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 200
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>{t('datasets.exportProgress')}</DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            py: 2
          }}
        >
          {/* 圆形进度指示器 */}
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={percentage}
              size={80}
              thickness={4}
              sx={{
                color: 'primary.main'
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h6" component="div" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                {`${percentage}%`}
              </Typography>
            </Box>
          </Box>

          {/* 进度详情 */}
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {t('datasets.exportingData')}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('datasets.processedCount', { processed, total })}
            </Typography>

            {/* 线性进度条 */}
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4
                }
              }}
            />
          </Box>

          {/* 状态提示 */}
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            {hasMore ? t('datasets.exportInProgress') : t('datasets.exportFinalizing')}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ExportProgressDialog;
