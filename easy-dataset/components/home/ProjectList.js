'use client';

import {
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import ProjectCard from './ProjectCard';

export default function ProjectList({ projects, onCreateProject }) {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  // 打开删除确认对话框
  const handleOpenDeleteDialog = (event, project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  // 关闭删除确认对话框
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  // 删除项目
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('projects.deleteFailed'));
      }

      // 刷新页面以更新项目列表
      window.location.reload();
    } catch (error) {
      console.error('删除项目失败:', error);
      alert(error.message || t('projects.deleteFailed'));
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        {projects.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('projects.noProjects')}
              </Typography>
              <Button variant="contained" onClick={onCreateProject} startIcon={<AddCircleOutlineIcon />} sx={{ mt: 2 }}>
                {t('projects.createFirst')}
              </Button>
            </Paper>
          </Grid>
        ) : (
          projects.map(project => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <ProjectCard project={project} onDeleteClick={handleOpenDeleteDialog} />
            </Grid>
          ))
        )}
      </Grid>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{t('projects.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {projectToDelete && (
              <>
                {t('projects.deleteConfirm')}
                <br />
                <Typography component="span" fontWeight="bold" sx={{ mt: 1, display: 'inline-block' }}>
                  {projectToDelete.name}
                </Typography>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained" disabled={loading}>
            {loading ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
