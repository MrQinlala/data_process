'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Radio
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

import {
  QUESTION_TYPES,
  FORMAT_PREVIEW,
  getJsonTemplateData,
  getExcelTemplateData,
  getColumnWidths
} from '../constants';
import {
  StyledDialogTitle,
  UploadBox,
  PreviewPaper,
  CodeBlock,
  ErrorContainer,
  TypeRadioGroup,
  TypeFormControlLabel
} from './ImportDialog.styles';

export default function ImportDialog({ open, onClose, projectId, onSuccess }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [questionType, setQuestionType] = useState('open_ended');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState([]);

  // 处理文件选择
  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (!['json', 'xls', 'xlsx'].includes(ext)) {
        setError(t('evalDatasets.import.invalidFileType', '不支持的文件格式，请上传 json、xls 或 xlsx 文件'));
        return;
      }
      setFile(selectedFile);
      setError(null);
      setErrorDetails([]);
    }
  };

  // 下载模板
  const handleDownloadTemplate = format => {
    if (!questionType) {
      setError(t('evalDatasets.import.selectTypeFirst', '请先选择题型'));
      return;
    }

    if (format === 'json') {
      // JSON 模板动态生成并下载
      const templateData = getJsonTemplateData(questionType);
      const jsonContent = JSON.stringify(templateData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eval-dataset-template-${questionType}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Excel 模板动态生成
      const templateData = getExcelTemplateData(questionType);
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

      // 设置列宽
      const colWidths = getColumnWidths(questionType);
      worksheet['!cols'] = colWidths;

      // 下载文件
      XLSX.writeFile(workbook, `eval-dataset-template-${questionType}.xlsx`);
    }
  };

  // 提交导入
  const handleSubmit = async () => {
    if (!questionType) {
      setError(t('evalDatasets.import.selectTypeFirst', '请先选择题型'));
      return;
    }
    if (!file) {
      setError(t('evalDatasets.import.selectFile', '请选择要导入的文件'));
      return;
    }

    setLoading(true);
    setError(null);
    setErrorDetails([]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('questionType', questionType);
      formData.append('tags', tags);

      const response = await fetch(`/api/projects/${projectId}/eval-datasets/import`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.code === 0) {
        onSuccess?.(result.data);
        handleClose();
      } else {
        setError(result.error || result.message);
        if (result.details) {
          setErrorDetails(result.details);
        }
      }
    } catch (err) {
      setError(err.message || t('evalDatasets.import.failed', '导入失败'));
    } finally {
      setLoading(false);
    }
  };

  // 关闭对话框
  const handleClose = () => {
    if (loading) return;
    setQuestionType('open_ended');
    setTags('');
    setFile(null);
    setError(null);
    setErrorDetails([]);
    onClose();
  };

  // 获取当前题型的格式预览
  const formatPreview = questionType ? FORMAT_PREVIEW[questionType] : null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <StyledDialogTitle>
        {t('evalDatasets.import.title', '导入评估数据集')}
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <DialogContent dividers>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            {errorDetails.length > 0 && (
              <ErrorContainer>
                {errorDetails.map((detail, index) => (
                  <Box key={index} className="item">
                    {detail}
                  </Box>
                ))}
                {errorDetails.length < 10 && (
                  <Box sx={{ mt: 0.5, color: 'text.secondary', ml: 2 }}>
                    {t('evalDatasets.import.showingErrors', '显示前 {{count}} 条错误', { count: errorDetails.length })}
                  </Box>
                )}
              </ErrorContainer>
            )}
          </Alert>
        )}

        {/* 题型选择 - 使用封装好的样式组件 */}
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
            {t('evalDatasets.import.questionType', '选择题型')}
          </Typography>
          <TypeRadioGroup value={questionType} onChange={e => setQuestionType(e.target.value)}>
            {QUESTION_TYPES.map(type => (
              <TypeFormControlLabel
                key={type.value}
                value={type.value}
                checked={questionType === type.value}
                control={<Radio size="small" />}
                label={t(type.label, type.labelZh)}
              />
            ))}
          </TypeRadioGroup>
        </Box>

        {/* 数据格式预览 */}
        {formatPreview && (
          <PreviewPaper variant="outlined">
            <Typography variant="subtitle2" className="title">
              {t('evalDatasets.import.formatPreview', '数据格式预览')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {formatPreview.fields.map(field => (
                <Chip key={field} label={field} size="small" variant="outlined" color="primary" />
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {formatPreview.description}
            </Typography>
            <CodeBlock>
              <pre style={{ margin: 0 }}>{JSON.stringify(formatPreview.example, null, 2)}</pre>
            </CodeBlock>

            {/* 下载模板按钮 */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="text"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadTemplate('json')}
              >
                JSON {t('evalDatasets.import.template', '模板')}
              </Button>
              <Button
                variant="text"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadTemplate('xlsx')}
              >
                Excel {t('evalDatasets.import.template', '模板')}
              </Button>
            </Box>
          </PreviewPaper>
        )}

        {/* 文件上传 */}
        <Box sx={{ mb: 3 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,.xls,.xlsx"
            style={{ display: 'none' }}
          />
          <UploadBox active={false} hasFile={!!file} onClick={() => fileInputRef.current?.click()}>
            {file ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <InsertDriveFileIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography color="primary" variant="h6">
                  {file.name}
                </Typography>
                <Chip label={`${(file.size / 1024).toFixed(1)} KB`} size="small" color="primary" variant="soft" />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {t('common.clickToReplace', '点击更换文件')}
                </Typography>
              </Box>
            ) : (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t('evalDatasets.import.dropOrClick', '点击或拖拽文件到此处')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('evalDatasets.import.supportedFormats', '支持 JSON、XLS、XLSX 格式')}
                </Typography>
              </Box>
            )}
          </UploadBox>
        </Box>

        {/* 标签输入 */}
        <TextField
          fullWidth
          label={t('evalDatasets.import.tags', '标签（可选）')}
          placeholder={t('evalDatasets.import.tagsPlaceholder', '为导入的数据添加标签，多个标签用逗号分隔')}
          value={tags}
          onChange={e => setTags(e.target.value)}
          disabled={loading}
          helperText={t('evalDatasets.import.tagsHelp', '导入的所有数据将打上这些标签')}
          InputProps={{
            startAdornment: tags ? <Box sx={{ mr: 1, color: 'text.secondary' }}>#</Box> : null
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} size="large">
          {t('common.cancel', '取消')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !questionType || !file}
          size="large"
          disableElevation
        >
          {loading ? t('evalDatasets.import.importing', '导入中...') : t('evalDatasets.import.import', '导入')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
