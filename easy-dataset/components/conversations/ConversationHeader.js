'use client';

import { Box, Button, Divider, Typography, IconButton, CircularProgress, Paper, Tooltip } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

/**
 * 多轮对话详情页面的头部导航组件
 */
export default function ConversationHeader({
  projectId,
  conversationId,
  conversation,
  editMode,
  saving,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onNavigate
}) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<NavigateBeforeIcon />} onClick={() => router.push(`/projects/${projectId}/multi-turn`)}>
            {t('common.backToList')}
          </Button>
          <Divider orientation="vertical" flexItem />
          <Typography variant="h6">{t('datasets.conversationDetail')}</Typography>
          {conversation && (
            <Typography variant="body2" color="text.secondary">
              {conversation.scenario && (
                <>
                  {conversation.scenario} • {conversation.turnCount}/{conversation.maxTurns} 轮
                </>
              )}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* 翻页按钮 */}
          <IconButton onClick={() => onNavigate && onNavigate('prev')}>
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton onClick={() => onNavigate && onNavigate('next')}>
            <NavigateNextIcon />
          </IconButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* 编辑/保存按钮 */}
          {editMode ? (
            <>
              <Button onClick={onCancel}>{t('common.cancel')}</Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={onSave}
                disabled={saving}
              >
                {saving ? t('datasets.saving') : t('common.save')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={onEdit}>
                {t('common.edit')}
              </Button>
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
                {t('common.delete')}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
