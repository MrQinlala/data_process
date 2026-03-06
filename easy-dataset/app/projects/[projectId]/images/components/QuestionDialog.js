'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { selectedModelInfoAtom } from '@/lib/store';
import { toast } from 'sonner';
import axios from 'axios';

export default function QuestionDialog({ open, projectId, image, onClose, onSuccess }) {
  const { t, i18n } = useTranslation();
  const selectedModel = useAtomValue(selectedModelInfoAtom);
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setCount(3);
      setError('');
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!selectedModel) {
      setError(t('images.selectModelFirst'));
      return;
    }

    if (selectedModel.type !== 'vision') {
      setError(t('images.visionModelRequired'));
      return;
    }

    if (count < 1 || count > 10) {
      setError(t('images.countRange'));
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`/api/projects/${projectId}/images/questions`, {
        imageName: image.imageName,
        count,
        model: selectedModel,
        language: i18n.language
      });

      toast.success(t('images.questionsGenerated', { count: response.data.questions.length }));
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to generate questions:', err);
      setError(err.response?.data?.error || t('images.generateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('images.generateQuestions')}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {image && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('images.imageName')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {image.imageName}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          type="number"
          label={t('images.questionCount')}
          value={count}
          onChange={e => setCount(parseInt(e.target.value) || 1)}
          inputProps={{ min: 1, max: 10 }}
          helperText={t('images.questionCountHelp')}
          disabled={loading}
        />

        {selectedModel && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {t('images.currentModel')}: {selectedModel.modelName}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={loading || !selectedModel}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {t('images.generateQuestions')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
