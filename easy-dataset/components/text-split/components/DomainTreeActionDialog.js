'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * 领域树操作选择对话框
 * 提供三种选项：修订领域树、重建领域树、不更改领域树
 */
export default function DomainTreeActionDialog({ open, onClose, onConfirm, isFirstUpload, action }) {
  const { t } = useTranslation();
  const [value, setValue] = useState(isFirstUpload ? 'rebuild' : 'revise');

  // 处理选项变更
  const handleChange = event => {
    setValue(event.target.value);
  };

  // 确认选择
  const handleConfirm = () => {
    onConfirm(value);
  };

  // 获取对话框标题
  const getDialogTitle = () => {
    if (isFirstUpload) {
      return t('textSplit.domainTree.firstUploadTitle');
    }
    return action === 'upload' ? t('textSplit.domainTree.uploadTitle') : t('textSplit.domainTree.deleteTitle');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset">
          <RadioGroup value={value} onChange={handleChange}>
            {!isFirstUpload && (
              <FormControlLabel
                value="revise"
                control={<Radio />}
                label={
                  <>
                    <Typography variant="subtitle1">{t('textSplit.domainTree.reviseOption')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('textSplit.domainTree.reviseDesc')}
                    </Typography>
                  </>
                }
              />
            )}
            <FormControlLabel
              value="rebuild"
              control={<Radio />}
              label={
                <>
                  <Typography variant="subtitle1">{t('textSplit.domainTree.rebuildOption')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('textSplit.domainTree.rebuildDesc')}
                  </Typography>
                </>
              }
            />
            {!isFirstUpload && (
              <FormControlLabel
                value="keep"
                control={<Radio />}
                label={
                  <>
                    <Typography variant="subtitle1">{t('textSplit.domainTree.keepOption')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('textSplit.domainTree.keepDesc')}
                    </Typography>
                  </>
                }
              />
            )}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          {t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
