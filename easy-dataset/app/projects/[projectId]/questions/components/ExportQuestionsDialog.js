'use client';

import { useState } from 'react';
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
  Box,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DownloadIcon from '@mui/icons-material/Download';

export default function ExportQuestionsDialog({ open, onClose, onExport, selectedCount, totalCount }) {
  const { t } = useTranslation();
  const [format, setFormat] = useState('json');
  const [exportScope, setExportScope] = useState('all');

  const handleExport = () => {
    const exportOptions = {
      format,
      selectedIds: exportScope === 'selected' ? [] : undefined
    };

    onExport(exportOptions);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('questions.exportQuestions')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* 导出范围 */}
          <FormControl component="fieldset">
            <FormLabel component="legend">{t('questions.exportScope')}</FormLabel>
            <RadioGroup value={exportScope} onChange={e => setExportScope(e.target.value)}>
              <FormControlLabel
                value="all"
                control={<Radio />}
                label={t('questions.exportAll', { count: totalCount })}
              />
              {selectedCount > 0 && (
                <FormControlLabel
                  value="selected"
                  control={<Radio />}
                  label={t('questions.exportSelected', { count: selectedCount })}
                />
              )}
            </RadioGroup>
          </FormControl>

          <Divider />

          {/* 导出格式 */}
          <FormControl component="fieldset">
            <FormLabel component="legend">{t('questions.exportFormat')}</FormLabel>
            <RadioGroup value={format} onChange={e => setFormat(e.target.value)}>
              <FormControlLabel value="json" control={<Radio />} label="JSON" />
              <FormControlLabel value="jsonl" control={<Radio />} label="JSONL" />
              <FormControlLabel value="txt" control={<Radio />} label={t('questions.txtFormat')} />
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleExport} variant="contained" startIcon={<DownloadIcon />}>
          {t('export.title')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
