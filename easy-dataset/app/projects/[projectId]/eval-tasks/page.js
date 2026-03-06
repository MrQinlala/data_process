'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Paper,
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
import RefreshIcon from '@mui/icons-material/Refresh';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useTranslation } from 'react-i18next';

import useEvalTasks from './hooks/useEvalTasks';
import CreateEvalTaskDialog from './components/CreateEvalTaskDialog';
import EvalTaskCard from './components/EvalTaskCard';
import styles from './styles';

export default function EvalTasksPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    tasks,
    loading,
    error,
    setError,
    loadTasks,
    deleteTask,
    interruptTask,
    page,
    setPage,
    pageSize,
    setPageSize,
    total
  } = useEvalTasks(projectId);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null });
  const [interruptDialog, setInterruptDialog] = useState({ open: false, task: null });

  const handleView = task => router.push(`/projects/${projectId}/eval-tasks/${task.id}`);
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

  return (
    <Container maxWidth="xl" sx={styles.pageContainer}>
      {/* 标题栏 */}
      <Box sx={styles.header}>
        <Typography variant="h5" sx={styles.headerTitle}>
          {t('evalTasks.title')}
        </Typography>
        <Box sx={styles.headerActions}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
            {t('evalTasks.createTask')}
          </Button>
        </Box>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 加载状态 */}
      {loading && tasks.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 空状态 */}
      {!loading && tasks.length === 0 && (
        <Paper variant="outlined" sx={styles.emptyState}>
          <AssessmentIcon sx={styles.emptyIcon} />
          <Typography variant="h6" color="text.secondary" sx={styles.emptyTitle}>
            {t('evalTasks.noTasks')}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={styles.emptyHint}>
            {t('evalTasks.noTasksHint')}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)} size="large">
            {t('evalTasks.createTask')}
          </Button>
        </Paper>
      )}

      {/* 任务列表 */}
      {tasks.length > 0 && (
        <>
          <Grid container spacing={2.5}>
            {tasks.map(task => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={task.id}>
                <EvalTaskCard task={task} onView={handleView} onDelete={handleDelete} onInterrupt={handleInterrupt} />
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
              rowsPerPageOptions={[12, 24, 48]}
              labelRowsPerPage={t('datasets.rowsPerPage', '每页行数')}
            />
          </Box>
        </>
      )}

      {/* 创建任务对话框 */}
      <CreateEvalTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        projectId={projectId}
        onSuccess={loadTasks}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, task: null })}>
        <DialogTitle>{t('evalTasks.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('evalTasks.deleteConfirmMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, task: null })}>{t('common.cancel')}</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 中断确认对话框 */}
      <Dialog open={interruptDialog.open} onClose={() => setInterruptDialog({ open: false, task: null })}>
        <DialogTitle>{t('evalTasks.interruptConfirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('evalTasks.interruptConfirmMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterruptDialog({ open: false, task: null })}>{t('common.cancel')}</Button>
          <Button onClick={confirmInterrupt} color="warning" variant="contained">
            {t('evalTasks.interrupt')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
