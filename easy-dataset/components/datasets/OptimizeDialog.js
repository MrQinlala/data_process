'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * AI优化对话框组件
 */
export default function OptimizeDialog({ open, onClose, onConfirm }) {
  const [advice, setAdvice] = useState('');
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm(advice);
    setAdvice('');
    onClose();
  };

  const handleClose = () => {
    onClose();
    setAdvice('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('datasets.optimizeTitle')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('datasets.optimizeAdvice')}
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          value={advice}
          onChange={e => setAdvice(e.target.value)}
          placeholder={t('datasets.optimizePlaceholder')}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary" disabled={!advice.trim()}>
          {t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
