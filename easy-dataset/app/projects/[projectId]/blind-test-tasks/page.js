'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useTranslation } from 'react-i18next';

import useBlindTestTasks from './hooks/useBlindTestTasks';
import BlindTestTaskCard from './components/BlindTestTaskCard';
import CreateBlindTestDialog from './components/CreateBlindTestDialog';

export default function BlindTestTasksPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    tasks,
    loading,
    error,
    setError,
    deleteTask,
    interruptTask,
    createTask,
    page,
    setPage,
    pageSize,
    setPageSize,
    total
  } = useBlindTestTasks(projectId);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null });
  const [interruptDialog, setInterruptDialog] = useState({ open: false, task: null });

  const handleView = task => router.push(`/projects/${projectId}/blind-test-tasks/${task.id}`);
  const handleContinue = task => router.push(`/projects/${projectId}/blind-test-tasks/${task.id}`);
  const handleDelete = task => setDeleteDialog({ open: true, task });
  const handleInterrupt = task => setInterruptDialog({ open: true, task });

  const handlePageChange = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handlePageSizeChange = event => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1);
  };

  const confirmDelete = async () => {
    if (deleteDialog.task) {
      await deleteTask(deleteDialog.task.id);
    }
    setDeleteDialog({ open: false, task: null });
  };

  const confirmInterrupt = async () => {
    if (interruptDialog.task) {
      await interruptTask(interruptDialog.task.id);
    }
    setInterruptDialog({ open: false, task: null });
  };

  const handleCreate = async taskData => {
    const result = await createTask(taskData);
    if (result.success) {
      // 创建成功后跳转到任务详情页开始盲测
      router.push(`/projects/${projectId}/blind-test-tasks/${result.data.id}`);
    }
    return result;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareArrowsIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {t('blindTest.title', '人工盲测任务')}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
          {t('blindTest.createTask', '创建任务')}
        </Button>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 加载状态 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 空状态 */}
      {!loading && tasks.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            textAlign: 'center'
          }}
        >
          <CompareArrowsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('blindTest.noTasks', '暂无盲测任务')}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            {t('blindTest.noTasksHint', '创建盲测任务来对比两个模型的回答质量')}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
            {t('blindTest.createTask', '创建任务')}
          </Button>
        </Box>
      )}

      {/* 任务列表 */}
      {!loading && tasks.length > 0 && (
        <>
          <Grid container spacing={2}>
            {tasks.map(task => (
              <Grid item xs={12} key={task.id}>
                <BlindTestTaskCard
                  task={task}
                  onView={handleView}
                  onDelete={handleDelete}
                  onInterrupt={handleInterrupt}
                  onContinue={handleContinue}
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <TablePagination
              component="div"
              count={total}
              page={page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handlePageSizeChange}
              rowsPerPageOptions={[6, 12, 24, 48]}
              labelRowsPerPage={t('datasets.rowsPerPage', '每页行数')}
            />
          </Box>
        </>
      )}

      {/* 创建对话框 */}
      <CreateBlindTestDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        projectId={projectId}
        onCreate={handleCreate}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, task: null })}>
        <DialogTitle>{t('blindTest.deleteConfirmTitle', '确认删除')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('blindTest.deleteConfirmMessage', '确定要删除这个盲测任务吗？此操作不可撤销。')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, task: null })}>{t('common.cancel', '取消')}</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            {t('common.delete', '删除')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 中断确认对话框 */}
      <Dialog open={interruptDialog.open} onClose={() => setInterruptDialog({ open: false, task: null })}>
        <DialogTitle>{t('blindTest.interruptConfirmTitle', '确认中断')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('blindTest.interruptConfirmMessage', '确定要中断这个盲测任务吗？已完成的评判结果将保留。')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterruptDialog({ open: false, task: null })}>{t('common.cancel', '取消')}</Button>
          <Button color="warning" variant="contained" onClick={confirmInterrupt}>
            {t('blindTest.interrupt', '中断')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
