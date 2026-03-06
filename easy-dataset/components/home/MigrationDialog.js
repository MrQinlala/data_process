'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Paper,
  useTheme,
  Tooltip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

/**
 * 项目迁移对话框组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.open - 对话框是否打开
 * @param {Function} props.onClose - 关闭对话框的回调函数
 * @param {Array<string>} props.projectIds - 需要迁移的项目ID列表
 */
export default function MigrationDialog({ open, onClose, projectIds = [] }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [migrating, setMigrating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [migratedCount, setMigratedCount] = useState(0);
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [processingIds, setProcessingIds] = useState([]);

  // 打开项目目录
  const handleOpenDirectory = async projectId => {
    try {
      setProcessingIds(prev => [...prev, projectId]);

      const response = await fetch('/api/projects/open-directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('migration.openDirectoryFailed'));
      }

      // 成功打开目录，不需要特别处理
    } catch (err) {
      console.error('打开目录错误:', err);
      setError(err.message);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== projectId));
    }
  };

  // 删除项目目录
  const handleDeleteDirectory = async projectId => {
    try {
      if (!window.confirm(t('migration.confirmDelete'))) {
        return;
      }

      setProcessingIds(prev => [...prev, projectId]);

      const response = await fetch('/api/projects/delete-directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('migration.deleteDirectoryFailed'));
      }

      // 从列表中移除已删除的项目
      const updatedProjectIds = projectIds.filter(id => id !== projectId);
      // 这里我们不能直接修改 projectIds，因为它是从父组件传入的
      // 但我们可以通知用户界面刷新
      window.location.reload();
    } catch (err) {
      console.error('删除目录错误:', err);
      setError(err.message);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== projectId));
    }
  };

  // 处理迁移操作
  const handleMigration = async () => {
    try {
      setMigrating(true);
      setError(null);
      setSuccess(false);
      setProgress(0);
      setStatusText(t('migration.starting'));

      // 调用异步迁移接口启动迁移任务
      const response = await fetch('/api/projects/migrate', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(t('migration.failed'));
      }

      const { success, taskId: newTaskId } = await response.json();

      if (!success || !newTaskId) {
        throw new Error(t('migration.startFailed'));
      }

      // 保存任务ID
      setTaskId(newTaskId);
      setStatusText(t('migration.processing'));

      // 开始轮询任务状态
      await pollMigrationStatus(newTaskId);
    } catch (err) {
      console.error('迁移错误:', err);
      setError(err.message);
      setMigrating(false);
    }
  };

  // 轮询迁移任务状态
  const pollMigrationStatus = async id => {
    try {
      // 定义轮询间隔（毫秒）
      const pollInterval = 1000;

      // 发送请求获取任务状态
      const response = await fetch(`/api/projects/migrate?taskId=${id}`);

      if (!response.ok) {
        throw new Error(t('migration.statusFailed'));
      }

      const { success, task } = await response.json();

      if (!success || !task) {
        throw new Error(t('migration.taskNotFound'));
      }

      // 更新进度
      setProgress(task.progress || 0);

      // 根据任务状态更新UI
      if (task.status === 'completed') {
        // 任务完成
        setMigratedCount(task.completed);
        setSuccess(true);
        setMigrating(false);
        setStatusText(t('migration.completed'));

        // 迁移成功后，延迟关闭对话框并刷新页面
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000);
      } else if (task.status === 'failed') {
        // 任务失败
        throw new Error(task.error || t('migration.failed'));
      } else {
        // 任务仍在进行中，继续轮询
        setTimeout(() => pollMigrationStatus(id), pollInterval);

        // 更新状态文本
        if (task.total > 0) {
          setStatusText(
            t('migration.progressStatus', {
              completed: task.completed || 0,
              total: task.total
            })
          );
        }
      }
    } catch (err) {
      console.error('获取迁移状态错误:', err);
      setError(err.message);
      setMigrating(false);
    }
  };

  return (
    <Dialog open={open} onClose={migrating ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <WarningAmberIcon color="warning" />
        <Typography variant="h6">{t('migration.title')}</Typography>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t('migration.success', { count: migratedCount })}
          </Alert>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('migration.description')}
        </Typography>

        {projectIds.length > 0 && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('migration.projectsList')}:
            </Typography>
            <Paper variant="outlined" sx={{ maxHeight: 180, overflow: 'auto' }}>
              <List dense>
                {projectIds.map(id => (
                  <ListItem key={id}>
                    <ListItemText primary={id} />
                    <ListItemSecondaryAction>
                      <Tooltip title={t('migration.openDirectory')}>
                        <IconButton
                          edge="end"
                          aria-label="open"
                          onClick={() => handleOpenDirectory(id)}
                          disabled={processingIds.includes(id)}
                          size="small"
                        >
                          <FolderOpenIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('migration.deleteDirectory')}>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteDirectory(id)}
                          disabled={processingIds.includes(id)}
                          size="small"
                          sx={{ ml: 1, color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        {migrating && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3, gap: 1.5 }}>
            <CircularProgress variant={progress > 0 ? 'determinate' : 'indeterminate'} value={progress} />
            <Typography variant="body2" color="text.secondary">
              {statusText || t('migration.migrating')}
            </Typography>
            {progress > 0 && (
              <Typography variant="body2" color="text.secondary">
                {progress}%
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={migrating}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleMigration} variant="contained" color="primary" disabled={migrating || success}>
          {migrating ? t('migration.migrating') : t('migration.migrate')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
