'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  TextField,
  Box,
  Typography,
  Alert
} from '@mui/material';

const ExportImageDatasetDialog = ({ open, onClose, onExport }) => {
  const { t } = useTranslation();
  const [formatType, setFormatType] = useState('raw');
  const [exportImages, setExportImages] = useState(false);
  const [includeImagePath, setIncludeImagePath] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [confirmedOnly, setConfirmedOnly] = useState(false);

  const handleExport = () => {
    onExport({
      formatType,
      exportImages,
      includeImagePath,
      systemPrompt,
      confirmedOnly
    });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle>{t('imageDatasets.exportTitle', '导出图片数据集')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {/* 导出格式选择 */}
          <FormControl component="fieldset">
            <FormLabel component="legend">{t('imageDatasets.exportFormat', '导出格式')}</FormLabel>
            <RadioGroup value={formatType} onChange={e => setFormatType(e.target.value)}>
              <FormControlLabel value="raw" control={<Radio />} label={t('imageDatasets.rawFormat', '原始格式')} />
              <FormControlLabel value="sharegpt" control={<Radio />} label="ShareGPT (OpenAI)" />
              <FormControlLabel value="alpaca" control={<Radio />} label="Alpaca" />
            </RadioGroup>
          </FormControl>

          {/* 图片导出选项 */}
          <Box>
            <FormControlLabel
              control={<Checkbox checked={exportImages} onChange={e => setExportImages(e.target.checked)} />}
              label={t('imageDatasets.exportImagesOption', '导出图片文件')}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
              {t('imageDatasets.exportImagesDesc', '将所有图片打包成 ZIP 压缩包一起下载')}
            </Typography>
          </Box>

          {/* 图片路径选项 */}
          <Box>
            <FormControlLabel
              control={<Checkbox checked={includeImagePath} onChange={e => setIncludeImagePath(e.target.checked)} />}
              label={t('imageDatasets.includeImagePath', '在数据集中包含图片路径')}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
              {t('imageDatasets.includeImagePathDesc', '在问题或答案中添加图片路径（格式：/images/图片名称）')}
            </Typography>
          </Box>

          {/* 系统提示词 */}
          <TextField
            label={t('imageDatasets.systemPrompt', '系统提示词（可选）')}
            multiline
            rows={3}
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            placeholder={t('imageDatasets.systemPromptPlaceholder', '输入系统提示词...')}
            fullWidth
          />

          {/* 仅导出已确认 */}
          <FormControlLabel
            control={<Checkbox checked={confirmedOnly} onChange={e => setConfirmedOnly(e.target.checked)} />}
            label={t('imageDatasets.confirmedOnly', '仅导出已确认的数据集')}
          />

          {/* 提示信息 */}
          <Alert severity="info" sx={{ mt: 1 }}>
            {t('imageDatasets.exportTip', '标签格式的答案将自动解析为文本（逗号分隔）')}
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          {t('common.cancel', '取消')}
        </Button>
        <Button onClick={handleExport} variant="contained">
          {t('export.title', '导出')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportImageDatasetDialog;
