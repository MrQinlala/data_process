'use client';

import {
  Container,
  Box,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper
} from '@mui/material';
import ConversationHeader from '@/components/conversations/ConversationHeader';
import ConversationMetadata from '@/components/conversations/ConversationMetadata';
import ConversationContent from '@/components/conversations/ConversationContent';
import ConversationRatingSection from '@/components/conversations/ConversationRatingSection';
import useConversationDetails from './useConversationDetails';
import { useTranslation } from 'react-i18next';

/**
 * 多轮对话详情页面
 */
export default function ConversationDetailPage({ params }) {
  const { projectId, conversationId } = params;
  const { t } = useTranslation();

  // 使用自定义Hook管理状态和逻辑
  const {
    conversation,
    messages,
    loading,
    editMode,
    saving,
    editData,
    setEditData,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleNavigate,
    updateMessageContent
  } = useConversationDetails(projectId, conversationId);

  // 加载状态
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <Alert severity="info">{t('datasets.loadingDataset')}</Alert>
        </Box>
      </Container>
    );
  }

  // 无数据状态
  if (!conversation) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{t('datasets.conversationNotFound')}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 顶部导航栏 */}
      <ConversationHeader
        projectId={projectId}
        conversationId={conversationId}
        conversation={conversation}
        editMode={editMode}
        saving={saving}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={() => setDeleteDialogOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* 主要布局：左右分栏 */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* 左侧主要内容区域 */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: 3 }}>
            {/* 对话内容 */}
            <ConversationContent
              messages={editMode ? editData.messages : messages}
              editMode={editMode}
              onMessageChange={updateMessageContent}
              conversation={conversation}
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
          {/* 元数据展示 */}
          <ConversationMetadata conversation={conversation} />

          {/* 评分、标签、备注区域 */}
          <ConversationRatingSection
            conversation={conversation}
            projectId={projectId}
            onUpdate={() => {
              // 更新成功后刷新数据，保持页面状态同步
              // 这里可以调用 useConversationDetails 的刷新逻辑
            }}
          />
        </Box>
      </Box>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('datasets.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('datasets.confirmDeleteConversation')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button color="error" onClick={handleDelete}>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
