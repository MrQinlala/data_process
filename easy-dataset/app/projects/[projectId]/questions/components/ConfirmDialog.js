'use client';

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * 确认对话框组件
 * @param {Object} props
 * @param {boolean} props.open - 对话框是否打开
 * @param {Function} props.onClose - 关闭对话框的回调函数
 * @param {Function} props.onConfirm - 确认操作的回调函数
 * @param {string} props.title - 对话框标题
 * @param {string} props.content - 对话框内容
 * @param {string} props.confirmText - 确认按钮文本，默认为 "确认删除"
 * @param {string} props.cancelText - 取消按钮文本，默认为 "取消"
 * @param {string} props.confirmColor - 确认按钮颜色，默认为 "error"
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  content,
  confirmText,
  cancelText,
  confirmColor = 'error'
}) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onClose();
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {cancelText || t('common.cancel')}
        </Button>
        <Button onClick={handleConfirm} color={confirmColor} variant="contained" autoFocus>
          {confirmText || t('common.confirmDelete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
