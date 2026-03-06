'use client';

import { Container, Box, Typography, Alert, Snackbar, Paper } from '@mui/material';
import { useEffect } from 'react';
import ChunkViewDialog from '@/components/text-split/ChunkViewDialog';
import DatasetHeader from '@/components/datasets/DatasetHeader';
import DatasetMetadata from '@/components/datasets/DatasetMetadata';
import EditableField from '@/components/datasets/EditableField';
import OptimizeDialog from '@/components/datasets/OptimizeDialog';
import DatasetRatingSection from '@/components/datasets/DatasetRatingSection';
import useDatasetDetails from '@/app/projects/[projectId]/datasets/[datasetId]/useDatasetDetails';
import { useTranslation } from 'react-i18next';

/**
 * 数据集详情页面
 */
export default function DatasetDetailsPage({ params }) {
  const { projectId, datasetId } = params;

  const { t } = useTranslation();
  // 使用自定义Hook管理状态和逻辑
  const {
    currentDataset,
    loading,
    editingAnswer,
    editingCot,
    editingQuestion,
    answerValue,
    cotValue,
    questionValue,
    snackbar,
    confirming,
    unconfirming,
    optimizeDialog,
    viewDialogOpen,
    viewChunk,
    datasetsAllCount,
    datasetsConfirmCount,
    answerTokens,
    cotTokens,
    shortcutsEnabled,
    setShortcutsEnabled,
    setSnackbar,
    setAnswerValue,
    setCotValue,
    setQuestionValue,
    setEditingAnswer,
    setEditingCot,
    setEditingQuestion,
    handleNavigate,
    handleConfirm,
    handleUnconfirm,
    handleSave,
    handleDelete,
    handleOpenOptimizeDialog,
    handleCloseOptimizeDialog,
    handleOptimize,
    handleViewChunk,
    handleCloseViewDialog
  } = useDatasetDetails(projectId, datasetId);

  // 加载状态
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <Alert severity="info">{t('datasets.loadingDataset')}</Alert>
        </Box>
      </Container>
    );
  }

  // 无数据状态
  if (!currentDataset) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{t('datasets.datasetNotFound')}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* 顶部导航栏 */}
      <DatasetHeader
        projectId={projectId}
        datasetsAllCount={datasetsAllCount}
        datasetsConfirmCount={datasetsConfirmCount}
        confirming={confirming}
        unconfirming={unconfirming}
        currentDataset={currentDataset}
        shortcutsEnabled={shortcutsEnabled}
        setShortcutsEnabled={setShortcutsEnabled}
        onNavigate={handleNavigate}
        onConfirm={handleConfirm}
        onUnconfirm={handleUnconfirm}
        onDelete={handleDelete}
      />

      {/* 主要布局：左右分栏 */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* 左侧主要内容区域 */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: 3 }}>
            <EditableField
              label={t('datasets.question')}
              value={questionValue}
              editing={editingQuestion}
              onEdit={() => setEditingQuestion(true)}
              onChange={e => setQuestionValue(e.target.value)}
              onSave={() => handleSave('question', questionValue)}
              dataset={currentDataset}
              onCancel={() => {
                setEditingQuestion(false);
                setQuestionValue(currentDataset.question);
              }}
            />

            <EditableField
              label={t('datasets.answer')}
              value={answerValue}
              editing={editingAnswer}
              onEdit={() => setEditingAnswer(true)}
              onChange={e => setAnswerValue(e.target.value)}
              onSave={() => handleSave('answer', answerValue)}
              onCancel={() => {
                setEditingAnswer(false);
                setAnswerValue(currentDataset.answer);
              }}
              dataset={currentDataset}
              onOptimize={handleOpenOptimizeDialog}
              tokenCount={answerTokens}
              optimizing={optimizeDialog.loading}
            />

            <EditableField
              label={t('datasets.cot')}
              value={cotValue}
              editing={editingCot}
              onEdit={() => setEditingCot(true)}
              onChange={e => setCotValue(e.target.value)}
              onSave={() => handleSave('cot', cotValue)}
              dataset={currentDataset}
              onCancel={() => {
                setEditingCot(false);
                setCotValue(currentDataset.cot || '');
              }}
              tokenCount={cotTokens}
            />
          </Paper>
        </Box>

        {/* 右侧固定侧边栏 */}
        <Box
          sx={{
            width: 360,
            position: 'sticky',
            top: 24,
            maxHeight: 'calc(100vh - 48px)',
            overflowY: 'auto'
          }}
        >
          {/* 数据集元数据信息 */}
          <DatasetMetadata currentDataset={currentDataset} onViewChunk={handleViewChunk} />

          {/* 评分、标签、备注区域 */}
          <DatasetRatingSection
            dataset={currentDataset}
            projectId={projectId}
            onUpdate={() => {
              // 更新成功后刷新数据，保持页面状态同步
              // 这里可以调用 useDatasetDetails 的刷新逻辑
            }}
            currentDataset={currentDataset}
          />
        </Box>
      </Box>

      {/* 消息提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* AI优化对话框 */}
      <OptimizeDialog open={optimizeDialog.open} onClose={handleCloseOptimizeDialog} onConfirm={handleOptimize} />

      {/* 文本块详情对话框 */}
      <ChunkViewDialog open={viewDialogOpen} chunk={viewChunk} onClose={handleCloseViewDialog} />
    </Container>
  );
}
