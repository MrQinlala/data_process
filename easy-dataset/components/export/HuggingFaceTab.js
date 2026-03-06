// HuggingFaceTab.js 组件
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Grid,
  Tooltip,
  IconButton,
  Link
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const HuggingFaceTab = ({
  projectId,
  systemPrompt,
  reasoningLanguage,
  confirmedOnly,
  includeCOT,
  formatType,
  fileFormat,
  customFields,
  handleSystemPromptChange,
  handleReasoningLanguageChange,
  handleConfirmedOnlyChange,
  handleIncludeCOTChange
}) => {
  const { t } = useTranslation();
  const [token, setToken] = useState('');
  const [datasetName, setDatasetName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [datasetUrl, setDatasetUrl] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(true);

  // 从配置中获取 huggingfaceToken
  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetch(`/api/projects/${projectId}/config`)
        .then(res => res.json())
        .then(data => {
          if (data.huggingfaceToken) {
            setToken(data.huggingfaceToken);
            setHasToken(true);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('获取 HuggingFace Token 失败:', err);
          setLoading(false);
        });
    }
  }, [projectId]);

  // 处理上传数据集到 HuggingFace
  const handleUpload = async () => {
    if (!hasToken) {
      return;
    }

    if (!datasetName) {
      setError('请输入数据集名称');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess(false);

      const response = await fetch(`/api/projects/${projectId}/huggingface/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          datasetName,
          isPrivate,
          formatType,
          systemPrompt,
          reasoningLanguage,
          confirmedOnly,
          includeCOT,
          fileFormat,
          customFields: formatType === 'custom' ? customFields : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '上传失败');
      }

      setSuccess(true);
      setDatasetUrl(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleOutlineIcon fontSize="inherit" />}>
          {t('export.uploadSuccess')}
          {datasetUrl && (
            <Box mt={1}>
              <Link href={datasetUrl} target="_blank" rel="noopener noreferrer">
                {t('export.viewOnHuggingFace')}
              </Link>
            </Box>
          )}
        </Alert>
      )}

      {!hasToken ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('export.noTokenWarning')}
          <Box mt={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => (window.location.href = `/projects/${projectId}/settings`)}
            >
              {t('export.goToSettings')}
            </Button>
          </Box>
        </Alert>
      ) : null}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {t('export.datasetSettings')}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('export.datasetName')}
              placeholder="username/dataset-name"
              value={datasetName}
              onChange={e => setDatasetName(e.target.value)}
              helperText={t('export.datasetNameHelp')}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />}
              label={t('export.privateDataset')}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {t('export.exportOptions')}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('export.systemPrompt')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={systemPrompt}
            onChange={handleSystemPromptChange}
            variant="outlined"
          />
        </Box>
        {/* Reasoning language – only for multilingual‑thinking */}
        {formatType === 'multilingualthinking' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {t('export.reasoningLanguage')}
            </Typography>
            <TextField
              fullWidth
              rows={3}
              multiline
              variant="outlined"
              placeholder={t('export.reasoningLanguage')}
              value={reasoningLanguage}
              onChange={handleReasoningLanguageChange}
            />
          </Box>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
          <FormControlLabel
            control={<Checkbox checked={confirmedOnly} onChange={handleConfirmedOnlyChange} />}
            label={t('export.onlyConfirmed')}
          />

          <FormControlLabel
            control={<Checkbox checked={includeCOT} onChange={handleIncludeCOTChange} />}
            label={t('export.includeCOT')}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={uploading || !hasToken || !datasetName}
          sx={{ borderRadius: 2 }}
        >
          {uploading ? <CircularProgress size={24} /> : t('export.uploadToHuggingFace')}
        </Button>
      </Box>
    </Box>
  );
};

export default HuggingFaceTab;
