'use client';

import { useState } from 'react';
import { Box, Typography, Button, TextField, IconButton, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTheme, alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

export default function EvalEditableField({
  label,
  value,
  multiline = true,
  onSave,
  placeholder,
  renderPreview, // Optional custom preview renderer
  renderEditor // Optional custom editor renderer (currentValue, onChange) => ReactNode
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = () => {
    setEditValue(value || '');
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditValue('');
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(editValue);
    }
    setEditing(false);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mr: 1 }}>
          {label}
        </Typography>
        {!editing && (
          <IconButton
            size="small"
            onClick={handleStartEdit}
            sx={{
              color: 'text.disabled',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {editing ? (
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          {renderEditor && renderEditor(editValue, setEditValue) ? (
            <Box sx={{ mb: 2 }}>{renderEditor(editValue, setEditValue)}</Box>
          ) : (
            <TextField
              fullWidth
              multiline={multiline}
              minRows={multiline ? 3 : 1}
              maxRows={15}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              placeholder={placeholder}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button size="small" startIcon={<CancelIcon />} onClick={handleCancel} color="inherit">
              {t('common.cancel')}
            </Button>
            <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
              {t('common.save')}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            minHeight: 40,
            transition: 'all 0.2s',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              boxShadow: `0 0 0 1px ${theme.palette.primary.main}`
            }
          }}
          onClick={handleStartEdit}
        >
          {renderPreview ? (
            renderPreview(value)
          ) : (
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                color: value ? 'text.primary' : 'text.disabled',
                fontStyle: value ? 'normal' : 'italic',
                lineHeight: 1.6
              }}
            >
              {value || t('common.noData')}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
