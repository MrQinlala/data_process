'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function ChunkBatchDeleteDialog({ open, onClose, onConfirm, loading, count }) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="batch-delete-dialog-title"
      aria-describedby="batch-delete-dialog-description"
    >
      <DialogTitle id="batch-delete-dialog-title">
        {t('textSplit.batchDeleteChunksConfirmTitle', { defaultValue: '确认批量删除' })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="batch-delete-dialog-description">
          {t('textSplit.batchDeleteChunksConfirmMessage', {
            count,
            defaultValue: `您确定要删除选中的 ${count} 个文本块吗？此操作不可恢复。`
          })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
