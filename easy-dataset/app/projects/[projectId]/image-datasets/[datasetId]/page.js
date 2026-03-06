'use client';

import { Container, Box, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import useImageDatasetDetails from '../hooks/useImageDatasetDetails';
import ImageDatasetHeader from '../components/ImageDatasetHeader';
import DatasetContent from '../components/DatasetContent';
import DatasetSidebar from '../components/DatasetSidebar';

export default function ImageDatasetDetailPage() {
  const { projectId, datasetId } = useParams();
  const { t } = useTranslation();

  const {
    currentDataset,
    loading,
    confirming,
    unconfirming,
    datasetsAllCount,
    datasetsConfirmCount,
    updateDataset,
    handleNavigate,
    handleConfirm,
    handleUnconfirm,
    handleDelete
  } = useImageDatasetDetails(projectId, datasetId);

  // 加载状态
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // 无数据状态
  if (!currentDataset) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">{t('imageDatasets.notFound', '数据集不存在')}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* 顶部导航栏 */}
      <ImageDatasetHeader
        projectId={projectId}
        datasetsAllCount={datasetsAllCount}
        datasetsConfirmCount={datasetsConfirmCount}
        confirming={confirming}
        unconfirming={unconfirming}
        currentDataset={currentDataset}
        onNavigate={handleNavigate}
        onConfirm={handleConfirm}
        onUnconfirm={handleUnconfirm}
        onDelete={handleDelete}
      />

      {/* 主要布局：左右分栏 */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* 左侧主要内容区域 */}
        <DatasetContent
          dataset={currentDataset}
          projectId={projectId}
          onAnswerChange={async newAnswer => {
            // 直接传递答案字符串，DatasetContent 已经处理了格式转换
            await updateDataset({ answer: newAnswer });
          }}
        />

        {/* 右侧固定侧边栏 */}
        <DatasetSidebar dataset={currentDataset} projectId={projectId} onUpdate={updateDataset} />
      </Box>
    </Container>
  );
}
