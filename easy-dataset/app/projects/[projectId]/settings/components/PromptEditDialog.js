import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';

/**
 * 提示词编辑对话框组件
 */
const PromptEditDialog = ({
  open,
  title,
  promptType,
  promptKey,
  content,
  loading,
  onClose,
  onSave,
  onRestore,
  onContentChange
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('settings.prompts.promptType')}: {promptType}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('settings.prompts.keyName')}: {promptKey}
          </Typography>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={15}
          value={content}
          onChange={e => onContentChange(e.target.value)}
          placeholder={t('settings.prompts.contentPlaceholder')}
          variant="outlined"
        />

        <Box display="flex" gap={1}>
          <Button startIcon={<RestoreIcon />} onClick={onRestore} size="small" variant="outlined">
            {t('settings.prompts.restoreDefaultContent')}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={onSave} variant="contained" disabled={loading} startIcon={<SaveIcon />}>
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromptEditDialog;
