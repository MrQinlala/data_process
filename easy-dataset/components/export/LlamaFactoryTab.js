// LlamaFactoryTab.js 组件
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const LlamaFactoryTab = ({
  projectId,
  systemPrompt,
  reasoningLanguage,
  confirmedOnly,
  includeCOT,
  formatType,
  handleSystemPromptChange,
  handleReasoningLanguageChange,
  handleConfirmedOnlyChange,
  handleIncludeCOTChange
}) => {
  const { t } = useTranslation();
  const [configExists, setConfigExists] = useState(false);
  const [configPath, setConfigPath] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // 检查配置文件是否存在
  useEffect(() => {
    if (projectId) {
      fetch(`/api/projects/${projectId}/llamaFactory/checkConfig`)
        .then(res => res.json())
        .then(data => {
          setConfigExists(data.exists);
          if (data.exists) {
            setConfigPath(data.configPath);
          }
        })
        .catch(err => {
          setError(err.message);
        });
    }
  }, [projectId, configExists]);

  // 复制路径到剪贴板
  const handleCopyPath = () => {
    const path = configPath.replace('dataset_info.json', '');
    navigator.clipboard.writeText(path).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 处理生成 Llama Factory 配置
  const handleGenerateConfig = async () => {
    try {
      setGenerating(true);
      setError('');

      const response = await fetch(`/api/projects/${projectId}/llamaFactory/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formatType,
          systemPrompt,
          reasoningLanguage,
          confirmedOnly,
          includeCOT
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      setConfigExists(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
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
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'row', gap: 4 }}>
        <FormControlLabel
          control={<Checkbox checked={confirmedOnly} onChange={handleConfirmedOnlyChange} />}
          label={t('export.onlyConfirmed')}
        />

        <FormControlLabel
          control={<Checkbox checked={includeCOT} onChange={handleIncludeCOTChange} />}
          label={t('export.includeCOT')}
        />
      </Box>

      {configExists ? (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            {t('export.configExists')}
          </Alert>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('export.configPath')}: {configPath.replace('dataset_info.json', '')}
            </Typography>
            <Tooltip title={copied ? t('common.copied') : t('common.copy')}>
              <IconButton size="small" onClick={handleCopyPath} sx={{ ml: 1 }}>
                {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('export.noConfig')}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={handleGenerateConfig} variant="contained" disabled={generating} sx={{ borderRadius: 2 }}>
          {generating ? (
            <CircularProgress size={24} />
          ) : configExists ? (
            t('export.updateConfig')
          ) : (
            t('export.generateConfig')
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default LlamaFactoryTab;
