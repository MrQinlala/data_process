'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Grid,
  Paper,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox as MuiCheckbox
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme, alpha } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ShortTextIcon from '@mui/icons-material/ShortText';
import NotesIcon from '@mui/icons-material/Notes';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TagIcon from '@mui/icons-material/Tag';
import DescriptionIcon from '@mui/icons-material/Description';

import useEvalDatasetDetails from './useEvalDatasetDetails';
import EvalDatasetHeader from '../components/EvalDatasetHeader';
import EvalEditableField from '../components/EvalEditableField';
import TagSelector from '@/components/datasets/TagSelector';

// 题型图标和颜色映射
const QUESTION_TYPE_CONFIG = {
  true_false: {
    icon: CheckCircleIcon,
    color: 'success',
    bgColor: 'success.light'
  },
  single_choice: {
    icon: RadioButtonCheckedIcon,
    color: 'primary',
    bgColor: 'primary.light'
  },
  multiple_choice: {
    icon: CheckBoxIcon,
    color: 'secondary',
    bgColor: 'secondary.light'
  },
  short_answer: {
    icon: ShortTextIcon,
    color: 'warning',
    bgColor: 'warning.light'
  },
  open_ended: {
    icon: NotesIcon,
    color: 'info',
    bgColor: 'info.light'
  }
};

export default function EvalDatasetDetailPage() {
  const { projectId, evalId } = useParams();
  const { t } = useTranslation();
  const theme = useTheme();
  const [availableTags, setAvailableTags] = useState([]);

  const { data, loading, error, handleNavigate, handleSave, handleDelete } = useEvalDatasetDetails(projectId, evalId);

  // 获取项目中已使用的标签
  useEffect(() => {
    const fetchAvailableTags = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/eval-datasets/tags`);
        if (response.ok) {
          const result = await response.json();
          setAvailableTags(result.tags || []);
        }
      } catch (error) {
        console.error('获取可用标签失败:', error);
      }
    };

    if (projectId && !loading) {
      fetchAvailableTags();
    }
  }, [projectId, loading]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">{error || t('eval.notFound')}</Alert>
      </Container>
    );
  }

  const typeConfig = QUESTION_TYPE_CONFIG[data.questionType] || QUESTION_TYPE_CONFIG.short_answer;
  const TypeIcon = typeConfig.icon;

  // 解析选项
  let options = [];
  try {
    options = data.options ? (typeof data.options === 'string' ? JSON.parse(data.options) : data.options) : [];
  } catch (e) {
    options = [];
  }

  // 渲染选项预览
  const renderOptionsPreview = value => {
    let opts = [];
    try {
      opts = value ? (typeof value === 'string' ? JSON.parse(value) : value) : [];
    } catch (e) {
      return <Typography color="error">Invalid JSON format</Typography>;
    }

    if (!Array.isArray(opts) || opts.length === 0) {
      return <Typography color="text.secondary">{t('common.noData')}</Typography>;
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {opts.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index);
          const isCorrect =
            data.questionType === 'multiple_choice'
              ? (Array.isArray(data.correctAnswer)
                  ? data.correctAnswer
                  : JSON.parse(data.correctAnswer || '[]')
                ).includes(optionLabel)
              : data.correctAnswer === optionLabel;

          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: isCorrect ? alpha(theme.palette.success.main, 0.08) : 'background.paper',
                border: '1px solid',
                borderColor: isCorrect ? alpha(theme.palette.success.main, 0.3) : 'divider'
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: isCorrect ? 'success.main' : 'text.secondary',
                  minWidth: 24
                }}
              >
                {optionLabel}.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: isCorrect ? 'success.dark' : 'text.primary'
                }}
              >
                {option}
              </Typography>
              {isCorrect && (
                <Chip
                  label={t('eval.correct')}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ ml: 'auto', height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  // 渲染答案编辑组件
  const renderAnswerEditor = (currentValue, onChange) => {
    if (data.questionType === 'true_false') {
      return (
        <RadioGroup value={currentValue} onChange={e => onChange(e.target.value)} row>
          <FormControlLabel value="✅" control={<Radio />} label={t('eval.correct')} />
          <FormControlLabel value="❌" control={<Radio />} label={t('eval.wrong')} />
        </RadioGroup>
      );
    }

    if (data.questionType === 'single_choice') {
      return (
        <RadioGroup value={currentValue} onChange={e => onChange(e.target.value)}>
          {options.map((_, index) => {
            const label = String.fromCharCode(65 + index);
            return (
              <FormControlLabel key={label} value={label} control={<Radio />} label={`${label}. ${options[index]}`} />
            );
          })}
        </RadioGroup>
      );
    }

    if (data.questionType === 'multiple_choice') {
      const selected = Array.isArray(currentValue) ? currentValue : JSON.parse(currentValue || '[]');
      const handleChange = label => {
        const newSelected = selected.includes(label) ? selected.filter(i => i !== label) : [...selected, label].sort();
        onChange(JSON.stringify(newSelected));
      };

      return (
        <FormGroup>
          {options.map((_, index) => {
            const label = String.fromCharCode(65 + index);
            return (
              <FormControlLabel
                key={label}
                control={<MuiCheckbox checked={selected.includes(label)} onChange={() => handleChange(label)} />}
                label={`${label}. ${options[index]}`}
              />
            );
          })}
        </FormGroup>
      );
    }

    return null; // 简答题和开放题保持默认文本框
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <EvalDatasetHeader projectId={projectId} onNavigate={handleNavigate} onDelete={handleDelete} />

      <Grid container spacing={3} alignItems="flex-start">
        {/* 左侧主要内容 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            {/* 题型标识 */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<TypeIcon sx={{ fontSize: '18px !important' }} />}
                label={t(`eval.questionTypes.${data.questionType}`)}
                color={typeConfig.color}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  py: 0.5,
                  height: 32
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <AccessTimeIcon sx={{ fontSize: 14 }} />
                {new Date(data.createAt).toLocaleString()}
              </Typography>
            </Box>

            {/* 问题 */}
            <EvalEditableField
              label={t('eval.question')}
              value={data.question}
              onSave={val => handleSave('question', val)}
              placeholder={t('eval.questionPlaceholder')}
            />

            {/* 选项 (仅选择题) */}
            {(data.questionType === 'single_choice' || data.questionType === 'multiple_choice') && (
              <EvalEditableField
                label={t('eval.options')}
                value={typeof data.options === 'string' ? data.options : JSON.stringify(data.options, null, 2)}
                onSave={val => handleSave('options', val)}
                placeholder={'["Option A", "Option B", ...]'}
                renderPreview={() => renderOptionsPreview(data.options)}
              />
            )}

            {/* 答案 */}
            <EvalEditableField
              label={t('eval.answer')}
              value={data.correctAnswer}
              onSave={val => handleSave('correctAnswer', val)}
              placeholder={t('eval.answerPlaceholder')}
              renderEditor={(val, setVal) => renderAnswerEditor(val, setVal)}
            />
          </Paper>
        </Grid>

        {/* 右侧侧边栏 */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3} sx={{ position: 'sticky', top: 24 }}>
            {/* 来源信息 */}
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <DescriptionIcon fontSize="small" />
                  {t('eval.sourceChunk')}
                </Typography>
                {data.chunks ? (
                  <>
                    <Chip
                      label={data.chunks.name || data.chunks.fileName}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2, maxWidth: '100%' }}
                    />
                    {data.chunks.content && (
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: 'background.paper',
                          maxHeight: 300,
                          overflow: 'auto',
                          fontSize: '0.875rem',
                          color: 'text.secondary',
                          borderRadius: 2,
                          border: '1px dashed',
                          borderColor: 'divider'
                        }}
                      >
                        {data.chunks.content}
                      </Paper>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    {t('common.noData')}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* 标签和备注 */}
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <TagIcon fontSize="small" />
                    {t('eval.tags')}
                  </Typography>
                  <TagSelector
                    value={
                      data.tags
                        ? typeof data.tags === 'string'
                          ? data.tags
                              .split(/[,，]/)
                              .map(t => t.trim())
                              .filter(Boolean)
                          : []
                        : []
                    }
                    onChange={newTags => handleSave('tags', newTags.join(', '))}
                    availableTags={availableTags}
                    placeholder={t('eval.tagsPlaceholder')}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <EvalEditableField
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotesIcon fontSize="small" />
                        {t('eval.note')}
                      </Box>
                    }
                    value={data.note}
                    onSave={val => handleSave('note', val)}
                    placeholder={t('eval.notePlaceholder')}
                  />
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
