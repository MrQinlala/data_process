'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar
} from '@mui/material';
import { Masonry } from '@mui/lab';
import { useTranslation } from 'react-i18next';

import useEvalDatasets from './hooks/useEvalDatasets';
import useExportEvalDatasets from './hooks/useExportEvalDatasets';
import EvalToolbar from './components/EvalToolbar';
import EvalDatasetCard from './components/EvalDatasetCard';
import EvalDatasetList from './components/EvalDatasetList';
import ImportDialog from './components/ImportDialog';
import BuiltinDatasetDialog from './components/BuiltinDatasetDialog';
import ExportEvalDialog from './components/ExportEvalDialog';

export default function EvalDatasetsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    items,
    total,
    stats,
    totalPages,
    loading,
    searching,
    error,
    page,
    setPage,
    questionType,
    setQuestionType,
    tags,
    setTags,
    keyword,
    setKeyword,
    viewMode,
    setViewMode,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    fetchData,
    deleteItems
  } = useEvalDatasets(projectId);

  // 导出 Hook
  const {
    dialogOpen: exportDialogOpen,
    openDialog: openExportDialog,
    closeDialog: closeExportDialog,
    exporting,
    error: exportError,
    format: exportFormat,
    setFormat: setExportFormat,
    questionTypes: exportQuestionTypes,
    setQuestionTypes: setExportQuestionTypes,
    selectedTags: exportSelectedTags,
    setSelectedTags: setExportSelectedTags,
    keyword: exportKeyword,
    setKeyword: setExportKeyword,
    previewTotal,
    previewLoading,
    availableTags: exportAvailableTags,
    resetFilters: resetExportFilters,
    handleExport
  } = useExportEvalDatasets(projectId, stats);

  // 删除确认对话框
  const [deleteDialog, setDeleteDialog] = useState({ open: false, ids: [] });

  // 导入对话框
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [builtinImportOpen, setBuiltinImportOpen] = useState(false);

  // Toast 提示
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // 处理导入成功
  const handleImportSuccess = result => {
    setToast({
      open: true,
      message: t('evalDatasets.import.successMessage', { count: result.total }),
      severity: 'success'
    });
    fetchData(); // 刷新数据
  };

  // 处理删除
  const handleDelete = async ids => {
    setDeleteDialog({ open: true, ids: Array.isArray(ids) ? ids : [ids] });
  };

  const confirmDelete = async () => {
    try {
      await deleteItems(deleteDialog.ids);
      setDeleteDialog({ open: false, ids: [] });
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // 处理编辑
  const handleEdit = item => {
    router.push(`/projects/${projectId}/eval-datasets/${item.id}`);
  };

  // 处理查看
  const handleView = item => {
    router.push(`/projects/${projectId}/eval-datasets/${item.id}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 工具栏（包含统计筛选） */}
      <EvalToolbar
        keyword={keyword}
        onKeywordChange={setKeyword}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedIds.length}
        onDeleteSelected={() => handleDelete(selectedIds)}
        stats={stats}
        questionType={questionType}
        onTypeChange={setQuestionType}
        tags={tags}
        onTagsChange={setTags}
        onRefresh={fetchData}
        loading={loading}
        onImport={() => setImportDialogOpen(true)}
        onBuiltinImport={() => setBuiltinImportOpen(true)}
        onExport={openExportDialog}
      />

      {/* 加载状态 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 内容区域 */}
      {!loading && (
        <Box sx={{ position: 'relative', minHeight: searching ? 200 : 'auto' }}>
          {/* 搜索加载遮罩 */}
          {searching && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 10,
                borderRadius: 2
              }}
            >
              <CircularProgress size={32} />
            </Box>
          )}

          {viewMode === 'card' ? (
            <Box>
              <Masonry
                columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
                spacing={3}
                sx={{ opacity: searching ? 0.5 : 1, transition: 'opacity 0.2s', width: 'auto' }}
              >
                {items.map(item => (
                  <EvalDatasetCard
                    key={item.id}
                    item={item}
                    selected={selectedIds.includes(item.id)}
                    onSelect={toggleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    projectId={projectId}
                  />
                ))}
              </Masonry>
            </Box>
          ) : (
            <Box sx={{ opacity: searching ? 0.5 : 1, transition: 'opacity 0.2s' }}>
              <EvalDatasetList
                items={items}
                selectedIds={selectedIds}
                onSelect={toggleSelect}
                onSelectAll={toggleSelectAll}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            </Box>
          )}

          {/* 空状态 */}
          {items.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {t('eval.noData')}
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {t('eval.noDataHint')}
              </Typography>
            </Box>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, ids: [] })}>
        <DialogTitle>{t('eval.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('eval.deleteConfirmMessage', { count: deleteDialog.ids.length })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, ids: [] })}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 导入对话框 */}
      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        projectId={projectId}
        onSuccess={handleImportSuccess}
      />

      {/* 内置数据集导入对话框 */}
      <BuiltinDatasetDialog
        open={builtinImportOpen}
        onClose={() => setBuiltinImportOpen(false)}
        projectId={projectId}
        onSuccess={handleImportSuccess}
      />

      {/* 导出对话框 */}
      <ExportEvalDialog
        open={exportDialogOpen}
        onClose={closeExportDialog}
        exporting={exporting}
        error={exportError}
        format={exportFormat}
        setFormat={setExportFormat}
        questionTypes={exportQuestionTypes}
        setQuestionTypes={setExportQuestionTypes}
        selectedTags={exportSelectedTags}
        setSelectedTags={setExportSelectedTags}
        keyword={exportKeyword}
        setKeyword={setExportKeyword}
        previewTotal={previewTotal}
        previewLoading={previewLoading}
        availableTags={exportAvailableTags}
        resetFilters={resetExportFilters}
        onExport={handleExport}
      />

      {/* Toast 提示 */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
