'use client';

import { useState } from 'react';
import { Container, Box, Typography, Grid, Pagination, CircularProgress, Card, Button } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { imageDatasetStyles } from './styles/imageDatasetStyles';
import { useImageDatasets } from './hooks/useImageDatasets';
import { useImageDatasetFilters } from './hooks/useImageDatasetFilters';
import ImageDatasetFilters from './components/ImageDatasetFilters';
import ImageDatasetFilterDialog from './components/ImageDatasetFilterDialog';
import ImageDatasetCard from './components/ImageDatasetCard';
import EmptyState from './components/EmptyState';
import ExportImageDatasetDialog from './components/ExportImageDatasetDialog';
import useImageDatasetExport from './hooks/useImageDatasetExport';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { alpha } from '@mui/material/styles';

export default function ImageDatasetsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // 使用筛选 Hook
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    scoreFilter,
    setScoreFilter,
    getActiveFilterCount,
    resetFilters
  } = useImageDatasetFilters(projectId);

  // 使用数据 Hook
  const { datasets, loading, page, setPage, pageSize, fetchDatasets } = useImageDatasets(projectId, {
    search: searchQuery,
    confirmed: statusFilter === 'all' ? undefined : statusFilter === 'confirmed',
    minScore: scoreFilter[0],
    maxScore: scoreFilter[1]
  });

  // 使用导出 Hook
  const { exportImageDatasets } = useImageDatasetExport(projectId);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardClick = datasetId => {
    router.push(`/projects/${projectId}/image-datasets/${datasetId}`);
  };

  const handleViewDetails = datasetId => {
    router.push(`/projects/${projectId}/image-datasets/${datasetId}`);
  };

  const handleDeleteDataset = async datasetId => {
    if (confirm(t('imageDatasets.deleteConfirm', '确定要删除这个数据集吗？'))) {
      try {
        await axios.delete(`/api/projects/${projectId}/image-datasets/${datasetId}`);
        toast.success(t('imageDatasets.deleteSuccess', '删除成功'));
        // 重新查询数据
        fetchDatasets();
      } catch (error) {
        console.error('Failed to delete dataset:', error);
        toast.error(t('imageDatasets.deleteFailed', '删除失败'));
      }
    }
  };

  const handleEvaluateDataset = datasetId => {
    toast.info(t('common.comingSoon', '功能开发中...'));
  };

  const handleResetFilters = () => {
    resetFilters();
    setFilterDialogOpen(false);
  };

  const handleApplyFilters = () => {
    setFilterDialogOpen(false);
    setPage(1);
  };

  const handleExport = async exportOptions => {
    setExportDialogOpen(false);
    await exportImageDatasets(exportOptions);
  };

  const totalPages = Math.ceil(datasets.total / pageSize);

  return (
    <Container maxWidth="xl" sx={imageDatasetStyles.pageContainer}>
      {/* 筛选区域 - 参考数据集管理的设计 */}
      <Card
        sx={{
          mb: 3,
          py: 2,
          px: 2,
          borderRadius: 2,
          boxShadow: 0,
          bgcolor: theme => alpha(theme.palette.primary.main, 0.06)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <ImageDatasetFilters
            searchQuery={searchQuery}
            onSearchChange={value => {
              setSearchQuery(value);
              setPage(1);
            }}
            onMoreFiltersClick={() => setFilterDialogOpen(true)}
            activeFilterCount={getActiveFilterCount()}
          />
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{ borderRadius: 2 }}
            onClick={() => setExportDialogOpen(true)}
          >
            {t('export.title')}
          </Button>
        </Box>
      </Card>

      {/* 数据集列表 */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : datasets.data.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Grid container spacing={3}>
            {datasets.data.map(dataset => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={dataset.id}>
                <ImageDatasetCard
                  dataset={dataset}
                  onClick={handleCardClick}
                  onView={handleViewDetails}
                  onDelete={handleDeleteDataset}
                  onEvaluate={handleEvaluateDataset}
                />
              </Grid>
            ))}
          </Grid>

          {/* 分页 */}
          {totalPages > 1 && (
            <Box sx={imageDatasetStyles.pagination}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* 筛选对话框 */}
      <ImageDatasetFilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        statusFilter={statusFilter}
        scoreFilter={scoreFilter}
        onStatusChange={setStatusFilter}
        onScoreChange={setScoreFilter}
        onResetFilters={handleResetFilters}
        onApplyFilters={handleApplyFilters}
      />

      {/* 导出对话框 */}
      <ExportImageDatasetDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
      />
    </Container>
  );
}
