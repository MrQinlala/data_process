'use client';

import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material';

/**
 * 通用确认对话框组件
 * @param {Object} props
 * @param {boolean} props.open - 对话框是否打开
 * @param {Function} props.onClose - 关闭对话框的回调
 * @param {Function} props.onConfirm - 确认操作的回调
 * @param {string} props.title - 对话框标题
 * @param {string} props.cancelText - 取消按钮文本
 * @param {string} props.confirmText - 确认按钮文本
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  cancelText = '取消',
  confirmText = '确认',
  confirmColor = 'error'
}) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="confirm-dialog-title">
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
