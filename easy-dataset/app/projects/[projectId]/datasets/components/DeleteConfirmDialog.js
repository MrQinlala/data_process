'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  Box,
  LinearProgress,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const DeleteConfirmDialog = ({ open, datasets, onClose, onConfirm, batch, progress, deleting }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dataset = datasets?.[0];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 3,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          {t('common.confirmDelete')}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pb: 2, pt: 1 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {batch
            ? t('datasets.batchconfirmDeleteMessage', {
                count: datasets.length
              })
            : t('common.confirmDeleteDataSet')}
        </Typography>
        {batch ? (
          ''
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: alpha(theme.palette.warning.light, 0.1),
              borderColor: theme.palette.warning.light
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
              {t('datasets.question')}：
            </Typography>
            <Typography variant="body2">{dataset?.question}</Typography>
          </Paper>
        )}
        {deleting && progress ? (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                {progress.percentage}%
              </Typography>
              <Box sx={{ width: '100%' }}>
                <LinearProgress
                  variant="determinate"
                  value={progress.percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: theme.palette.primary.main
                    }
                  }}
                />
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('datasets.deletingProgress', '正在删除 {{completed}}/{{total}} 个数据集...', {
                completed: progress.completed,
                total: progress.total
              })}
            </Typography>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={deleting} sx={{ borderRadius: 2 }}>
          {t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={deleting} sx={{ borderRadius: 2 }}>
          {deleting ? t('common.deleting') : t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
