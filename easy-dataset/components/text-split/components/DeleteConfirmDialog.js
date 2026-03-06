'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function DeleteConfirmDialog({ open, fileName, onClose, onConfirm }) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="delete-dialog-title">
        {t('common.confirmDelete')}「{fileName}」?
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">{t('common.confirmDeleteDescription')}</DialogContentText>

        <Alert severity="warning" sx={{ my: 2 }}>
          <Typography variant="body2" component="div" fontWeight="medium">
            {t('textSplit.deleteFileWarning')}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" component="div">
              • {t('textSplit.deleteFileWarningChunks')}
            </Typography>
            <Typography variant="body2" component="div">
              • {t('textSplit.deleteFileWarningQuestions')}
            </Typography>
            <Typography variant="body2" component="div">
              • {t('textSplit.deleteFileWarningDatasets')}
            </Typography>
          </Box>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
