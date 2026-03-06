'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function TemplateFormDialog({ open, onClose, onSubmit, template }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    question: '',
    sourceType: 'text',
    answerType: 'text',
    description: '',
    labels: [],
    customFormat: '',
    autoGenerate: true
  });
  const [labelInput, setLabelInput] = useState('');
  const [errors, setErrors] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        question: template.question || '',
        sourceType: template.sourceType || 'text',
        answerType: template.answerType || 'text',
        description: template.description || '',
        labels: template.labels || [],
        customFormat: template.customFormat ? JSON.stringify(template.customFormat, null, 2) : '',
        autoGenerate: true // 编辑模式下默认不自动生成
      });
    } else {
      setFormData({
        question: '',
        sourceType: 'text',
        answerType: 'text',
        description: '',
        labels: [],
        customFormat: '',
        autoGenerate: true
      });
    }
    setErrors({});
    setShowConfirmDialog(false);
  }, [template, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAddLabel = () => {
    const trimmed = labelInput.trim();
    if (trimmed && !formData.labels.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, trimmed]
      }));
      setLabelInput('');
    }
  };

  const handleDeleteLabel = labelToDelete => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToDelete)
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.question.trim()) {
      newErrors.question = t('questions.template.errors.questionRequired');
    }

    if (formData.answerType === 'label' && formData.labels.length === 0) {
      newErrors.labels = t('questions.template.errors.labelsRequired');
    }

    if (formData.answerType === 'custom_format') {
      if (!formData.customFormat.trim()) {
        newErrors.customFormat = t('questions.template.errors.customFormatRequired');
      } else {
        try {
          JSON.parse(formData.customFormat);
        } catch (e) {
          newErrors.customFormat = t('questions.template.errors.invalidJson');
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    // 如果选择了自动生成，显示确认对话框
    if (formData.autoGenerate) {
      setShowConfirmDialog(true);
      return;
    }

    // 直接提交
    submitTemplate();
  };

  const submitTemplate = () => {
    const submitData = {
      question: formData.question.trim(),
      sourceType: formData.sourceType,
      answerType: formData.answerType,
      description: formData.description.trim(),
      autoGenerate: formData.autoGenerate,
      templateId: template?.id // 编辑模式时传递模板ID，用于查找未创建问题的数据源
    };

    if (formData.answerType === 'label') {
      submitData.labels = formData.labels;
    }

    if (formData.answerType === 'custom_format') {
      try {
        submitData.customFormat = JSON.parse(formData.customFormat);
      } catch (e) {
        // 已在验证中处理
        return;
      }
    }

    onSubmit(submitData);
    setShowConfirmDialog(false);
  };

  const handleConfirmGenerate = () => {
    submitTemplate();
  };

  const handleCancelGenerate = () => {
    setShowConfirmDialog(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{template ? t('questions.template.edit') : t('questions.template.create')}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 数据源类型 */}
          <FormControl fullWidth>
            <InputLabel>{t('questions.template.sourceTypeInfo')}</InputLabel>
            <Select
              value={formData.sourceType}
              label={t('questions.template.sourceTypeInfo')}
              onChange={e => handleChange('sourceType', e.target.value)}
            >
              <MenuItem value="text">{t('questions.template.sourceType.text')}</MenuItem>
              <MenuItem value="image">{t('questions.template.sourceType.image')}</MenuItem>
            </Select>
          </FormControl>

          {/* 问题内容 */}
          <TextField
            fullWidth
            label={t('questions.template.question')}
            value={formData.question}
            onChange={e => handleChange('question', e.target.value)}
            error={!!errors.question}
            helperText={errors.question}
            required
          />

          {/* 答案类型 */}
          <FormControl fullWidth>
            <InputLabel>{t('questions.template.answerType.label')}</InputLabel>
            <Select
              value={formData.answerType}
              label={t('questions.template.answerType.label')}
              onChange={e => handleChange('answerType', e.target.value)}
            >
              <MenuItem value="text">{t('questions.template.answerType.text')}</MenuItem>
              <MenuItem value="label">{t('questions.template.answerType.tags')}</MenuItem>
              <MenuItem value="custom_format">{t('questions.template.answerType.customFormat')}</MenuItem>
            </Select>
          </FormControl>

          {/* 描述 */}
          <TextField
            fullWidth
            label={t('questions.template.description')}
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            helperText={t('questions.template.descriptionHelp')}
            multiline
            rows={2}
          />

          {/* 标签输入 (仅当答案类型为 label 时显示) */}
          {formData.answerType === 'label' && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  label={t('questions.template.addLabel')}
                  value={labelInput}
                  onChange={e => setLabelInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                  error={!!errors.labels}
                  helperText={errors.labels}
                />
                <Button variant="outlined" onClick={handleAddLabel} sx={{ minWidth: '100px' }}>
                  {t('common.add')}
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.labels.map(label => (
                  <Chip
                    key={label}
                    label={label}
                    onDelete={() => handleDeleteLabel(label)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* 自定义格式输入 (仅当答案类型为 custom_format 时显示) */}
          {formData.answerType === 'custom_format' && (
            <Box>
              <TextField
                fullWidth
                label={t('questions.template.customFormat')}
                value={formData.customFormat}
                onChange={e => handleChange('customFormat', e.target.value)}
                multiline
                rows={6}
                error={!!errors.customFormat}
                helperText={errors.customFormat || t('questions.template.customFormatHelp')}
                placeholder='{"field1": "description", "field2": "description"}'
              />
              <Alert severity="info" sx={{ mt: 1 }}>
                {t('questions.template.customFormatInfo')}
              </Alert>
            </Box>
          )}

          {/* 自动生成问题选项 */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.autoGenerate}
                  onChange={e => handleChange('autoGenerate', e.target.checked)}
                  color="primary"
                />
              }
              label={t('questions.template.autoGenerate')}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 0.5 }}>
              {formData.sourceType === 'text'
                ? t('questions.template.autoGenerateHelpText')
                : t('questions.template.autoGenerateHelpImage')}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained">
          {template ? t('common.save') : t('common.create')}
        </Button>
      </DialogActions>

      {/* 自动生成确认对话框 */}
      <Dialog open={showConfirmDialog} onClose={handleCancelGenerate}>
        <DialogTitle>{t('questions.template.confirmAutoGenerate')}</DialogTitle>
        <DialogContent>
          <Typography>
            {template
              ? formData.sourceType === 'text'
                ? t('questions.template.confirmAutoGenerateEditTextMessage', {
                    defaultValue: '您选择了自动生成问题。系统将为所有还未创建此模板问题的文本块创建问题。'
                  })
                : t('questions.template.confirmAutoGenerateEditImageMessage', {
                    defaultValue: '您选择了自动生成问题。系统将为所有还未创建此模板问题的图片创建问题。'
                  })
              : formData.sourceType === 'text'
                ? t('questions.template.confirmAutoGenerateTextMessage')
                : t('questions.template.confirmAutoGenerateImageMessage')}
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('questions.template.autoGenerateWarning')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelGenerate}>{t('common.cancel')}</Button>
          <Button onClick={handleConfirmGenerate} variant="contained" color="primary">
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
