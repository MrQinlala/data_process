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

export default function DatasetDialog({ open, projectId, image, onClose, onSuccess }) {
  const { t, i18n } = useTranslation();
  const selectedModel = useAtomValue(selectedModelInfoAtom);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setQuestion('');
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

    if (!question.trim()) {
      setError(t('images.questionRequired'));
      return;
    }

    try {
      setLoading(true);
      setError('');

      await axios.post(`/api/projects/${projectId}/images/datasets`, {
        imageName: image.imageName,
        question: { question: question.trim() },
        model: selectedModel,
        language: i18n.language
      });

      toast.success(t('images.datasetGenerated'));
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to generate dataset:', err);
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
      <DialogTitle>{t('images.generateDataset')}</DialogTitle>
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
          multiline
          rows={4}
          label={t('images.question')}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder={t('images.questionPlaceholder')}
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
          disabled={loading || !selectedModel || !question.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {t('datasets.generateDataset')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
