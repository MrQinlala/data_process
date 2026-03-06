'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Card,
  CardContent,
  IconButton,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 评估集变体编辑对话框
 */
export default function EvalVariantDialog({ open, onClose, onGenerate, onSave }) {
  const { t } = useTranslation();
  const [step, setStep] = useState('config'); // 'config' | 'preview'
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    questionType: 'open_ended',
    count: 1
  });
  const [items, setItems] = useState([]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep('config');
      setConfig({ questionType: 'open_ended', count: 1 });
      setItems([]);
      setLoading(false);
    }
  }, [open]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await onGenerate(config);
      // Ensure data is an array
      const newItems = Array.isArray(data) ? data : [data];
      setItems(newItems);
      setStep('preview');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave(items);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleDeleteItem = index => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    if (newItems.length === 0) {
      setStep('config');
    }
  };

  const renderConfigStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {t('datasets.evalVariantConfigHint', '请选择生成的题目类型和数量，AI 将基于当前问答对进行改写。')}
      </Typography>

      <FormControl fullWidth>
        <InputLabel>{t('datasets.questionType', '题目类型')}</InputLabel>
        <Select
          value={config.questionType}
          label={t('datasets.questionType', '题目类型')}
          onChange={e => setConfig({ ...config, questionType: e.target.value })}
        >
          <MenuItem value="open_ended">{t('datasets.typeOpenEnded', '开放式问答')}</MenuItem>
          <MenuItem value="single_choice">{t('datasets.typeSingleChoice', '单选题')}</MenuItem>
          <MenuItem value="multiple_choice">{t('datasets.typeMultipleChoice', '多选题')}</MenuItem>
          <MenuItem value="true_false">{t('datasets.typeTrueFalse', '判断题')}</MenuItem>
          <MenuItem value="short_answer">{t('datasets.typeShortAnswer', '简答题')}</MenuItem>
        </Select>
      </FormControl>

      <Box>
        <Typography gutterBottom>
          {t('datasets.generateCount', '生成数量')}: {config.count}
        </Typography>
        <Slider
          value={config.count}
          onChange={(_, value) => setConfig({ ...config, count: value })}
          step={1}
          marks
          min={1}
          max={5}
          valueLabelDisplay="auto"
        />
      </Box>
    </Box>
  );

  const renderPreviewStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {t('datasets.evalVariantPreviewHint', '您可以编辑生成的题目，确认无误后保存到评估集。')}
      </Typography>

      {items.map((item, index) => (
        <Card key={index} variant="outlined">
          <CardContent sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <IconButton
              size="small"
              onClick={() => handleDeleteItem(index)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>

            <Typography variant="subtitle2" color="primary">
              {t('datasets.questionIndex', '题目 {{index}}', { index: index + 1 })}
            </Typography>

            <TextField
              label={t('datasets.question', '问题')}
              fullWidth
              multiline
              rows={2}
              value={item.question || ''}
              onChange={e => handleItemChange(index, 'question', e.target.value)}
              size="small"
            />

            {/* Render Options for choice questions */}
            {(item.options || config.questionType.includes('choice')) && (
              <TextField
                label={t('datasets.options', '选项 (JSON数组)')}
                fullWidth
                multiline
                rows={2}
                value={Array.isArray(item.options) ? JSON.stringify(item.options) : item.options || ''}
                onChange={e => {
                  let val = e.target.value;
                  try {
                    // Try to parse if user inputs valid JSON, otherwise keep string
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed)) val = parsed;
                  } catch (e) {}
                  handleItemChange(index, 'options', val);
                }}
                helperText={t('datasets.optionsHint', '例如: ["选项A", "选项B"]')}
                size="small"
              />
            )}

            <TextField
              label={t('datasets.answer', '答案')}
              fullWidth
              multiline
              rows={2}
              value={Array.isArray(item.correctAnswer) ? JSON.stringify(item.correctAnswer) : item.correctAnswer || ''}
              onChange={e => {
                let val = e.target.value;
                // For multiple choice, answer might be array
                if (config.questionType === 'multiple_choice') {
                  try {
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed)) val = parsed;
                  } catch (e) {}
                }
                handleItemChange(index, 'correctAnswer', val);
              }}
              helperText={
                config.questionType === 'multiple_choice'
                  ? t('datasets.answerArrayHint', '多选题答案请输入数组，如 ["A", "C"]')
                  : config.questionType === 'true_false'
                    ? t('datasets.answerBoolHint', '判断题答案请输入 ✅ 或 ❌')
                    : ''
              }
              size="small"
            />
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {step === 'config'
          ? t('datasets.evalVariantTitle', '生成评估集变体')
          : t('datasets.evalVariantPreviewTitle', '确认生成的题目')}
      </DialogTitle>

      <DialogContent dividers>{step === 'config' ? renderConfigStep() : renderPreviewStep()}</DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>

        {step === 'config' ? (
          <Button
            onClick={handleGenerate}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? t('common.generating', '生成中...') : t('datasets.generate', '生成')}
          </Button>
        ) : (
          <Button onClick={handleSave} variant="contained" color="primary" disabled={items.length === 0}>
            {t('datasets.saveToEval', '保存到评估集')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
