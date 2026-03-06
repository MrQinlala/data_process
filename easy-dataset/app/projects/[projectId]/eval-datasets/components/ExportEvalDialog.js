'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Alert,
  CircularProgress,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';

const QUESTION_TYPES = [
  { value: 'true_false', labelKey: 'eval.questionTypes.true_false' },
  { value: 'single_choice', labelKey: 'eval.questionTypes.single_choice' },
  { value: 'multiple_choice', labelKey: 'eval.questionTypes.multiple_choice' },
  { value: 'short_answer', labelKey: 'eval.questionTypes.short_answer' },
  { value: 'open_ended', labelKey: 'eval.questionTypes.open_ended' }
];

const EXPORT_FORMATS = [
  { value: 'json', label: 'JSON', description: 'evalDatasets.export.jsonDesc' },
  { value: 'jsonl', label: 'JSONL', description: 'evalDatasets.export.jsonlDesc' },
  { value: 'csv', label: 'CSV', description: 'evalDatasets.export.csvDesc' }
];

export default function ExportEvalDialog({
  open,
  onClose,
  exporting,
  error,
  format,
  setFormat,
  questionTypes,
  setQuestionTypes,
  selectedTags,
  setSelectedTags,
  keyword,
  setKeyword,
  previewTotal,
  previewLoading,
  availableTags,
  resetFilters,
  onExport
}) {
  const { t } = useTranslation();

  const hasFilters = questionTypes.length > 0 || selectedTags.length > 0 || keyword;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileDownloadIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('evalDatasets.export.title', '导出评估数据集')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={exporting} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* 导出格式选择 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            {t('evalDatasets.export.formatLabel', '导出格式')}
          </Typography>
          <ToggleButtonGroup
            value={format}
            exclusive
            onChange={(e, newFormat) => newFormat && setFormat(newFormat)}
            fullWidth
            size="small"
          >
            {EXPORT_FORMATS.map(f => (
              <ToggleButton key={f.value} value={f.value} sx={{ flex: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {f.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t(f.description, f.label)}
                  </Typography>
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 筛选条件 */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterAltIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
              {t('evalDatasets.export.filterLabel', '筛选条件')}
            </Typography>
            {hasFilters && (
              <Button size="small" startIcon={<ClearIcon />} onClick={resetFilters}>
                {t('evalTasks.clearFilter', '清空')}
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 关键字搜索 */}
            <TextField
              fullWidth
              size="small"
              label={t('evalTasks.searchKeyword', '搜索关键字')}
              placeholder={t('evalTasks.searchPlaceholder', '搜索题目内容...')}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />

            {/* 题型和标签筛选 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* 题型筛选 */}
              <FormControl fullWidth size="small">
                <InputLabel>{t('evalTasks.filterByTypeLabel', '题型筛选')}</InputLabel>
                <Select
                  multiple
                  value={questionTypes}
                  onChange={e => setQuestionTypes(e.target.value)}
                  input={<OutlinedInput label={t('evalTasks.filterByTypeLabel', '题型筛选')} />}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(value => (
                        <Chip key={value} label={t(`eval.questionTypes.${value}`)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {QUESTION_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Checkbox checked={questionTypes.includes(type.value)} />
                      <ListItemText primary={t(type.labelKey)} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 标签筛选 */}
              <FormControl fullWidth size="small">
                <InputLabel>{t('evalTasks.filterByTagLabel', '标签筛选')}</InputLabel>
                <Select
                  multiple
                  value={selectedTags}
                  onChange={e => setSelectedTags(e.target.value)}
                  input={<OutlinedInput label={t('evalTasks.filterByTagLabel', '标签筛选')} />}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(value => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 300 }
                    }
                  }}
                  disabled={availableTags.length === 0}
                >
                  {availableTags.length === 0 ? (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {t('evalDatasets.export.noTagsAvailable', '暂无可用标签')}
                      </Typography>
                    </MenuItem>
                  ) : (
                    availableTags.map(tag => (
                      <MenuItem key={tag} value={tag}>
                        <Checkbox checked={selectedTags.includes(tag)} />
                        <ListItemText primary={tag} />
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        {/* 导出预览 */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('evalDatasets.export.previewLabel', '将导出数据：')}
          </Typography>
          {previewLoading ? (
            <CircularProgress size={16} />
          ) : (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {previewTotal} {t('evalDatasets.export.records', '条记录')}
            </Typography>
          )}
        </Box>

        {previewTotal > 1000 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('evalDatasets.export.largeDataHint', '数据量较大，将采用流式导出，请耐心等待')}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={exporting} color="inherit">
          {t('common.cancel', '取消')}
        </Button>
        <Button
          onClick={onExport}
          variant="contained"
          disabled={exporting || previewLoading || previewTotal === 0}
          startIcon={exporting ? <CircularProgress size={16} /> : <FileDownloadIcon />}
        >
          {exporting ? t('evalDatasets.export.exporting', '导出中...') : t('evalDatasets.export.exportBtn', '导出')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
