'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Divider, Paper, TextField } from '@mui/material';
import { toast } from 'sonner';
import StarRating from '@/components/datasets/StarRating';
import TagSelector from '@/components/datasets/TagSelector';
import NoteInput from '@/components/datasets/NoteInput';
import { useTranslation } from 'react-i18next';

/**
 * 多轮对话评分、标签、备注综合组件
 */
export default function ConversationRatingSection({ conversation, projectId, onUpdate }) {
  const { t } = useTranslation();
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);

  // 解析对话中的标签
  const parseConversationTags = tagsString => {
    try {
      if (typeof tagsString === 'string' && tagsString.trim()) {
        return tagsString.split(/\s+/).filter(tag => tag.length > 0);
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  // 本地状态管理
  const [localScore, setLocalScore] = useState(conversation.score || 0);
  const [localTags, setLocalTags] = useState(() => parseConversationTags(conversation.tags));
  const [localNote, setLocalNote] = useState(conversation.note || '');

  // 获取项目中已使用的标签
  useEffect(() => {
    const fetchAvailableTags = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/dataset-conversations/tags`);
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data.tags || []);
        }
      } catch (error) {
        console.error('获取可用标签失败:', error);
      }
    };

    if (projectId) {
      fetchAvailableTags();
    }
  }, [projectId]);

  // 同步props中的conversation到本地状态
  useEffect(() => {
    setLocalScore(conversation.score || 0);
    setLocalTags(parseConversationTags(conversation.tags));
    setLocalNote(conversation.note || '');
  }, [conversation]);

  // 更新对话元数据
  const updateMetadata = async updates => {
    if (loading) return;

    // 立即更新本地状态
    if (updates.score !== undefined) {
      setLocalScore(updates.score);
    }
    if (updates.tagsArray !== undefined) {
      setLocalTags(updates.tagsArray);
    }
    if (updates.note !== undefined) {
      setLocalNote(updates.note);
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/dataset-conversations/${conversation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score: updates.score,
          tags: updates.tags,
          note: updates.note
        })
      });

      if (!response.ok) {
        throw new Error(t('datasets.saveFailed'));
      }

      const result = await response.json();
      toast.success(t('datasets.saveSuccess'));

      // 如果有父组件的更新回调，调用它
      if (onUpdate) {
        onUpdate(result.data);
      }
    } catch (error) {
      console.error('更新对话元数据失败:', error);
      toast.error(error.message || t('datasets.saveFailed'));

      // 出错时恢复本地状态
      if (updates.score !== undefined) {
        setLocalScore(conversation.score || 0);
      }
      if (updates.tagsArray !== undefined) {
        setLocalTags(parseConversationTags(conversation.tags));
      }
      if (updates.note !== undefined) {
        setLocalNote(conversation.note || '');
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理评分变更
  const handleScoreChange = newScore => {
    updateMetadata({ score: newScore });
  };

  // 处理标签变更
  const handleTagsChange = newTags => {
    const tagsString = Array.isArray(newTags) ? newTags.join(' ') : '';
    updateMetadata({ tags: tagsString, tagsArray: newTags });
  };

  // 处理备注变更
  const handleNoteChange = newNote => {
    updateMetadata({ note: newNote });
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      {/* 评分区域 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          {t('datasets.rating')}
        </Typography>
        <StarRating value={localScore} onChange={handleScoreChange} readOnly={loading} />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 标签区域 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          {t('datasets.customTags')}
        </Typography>
        <TagSelector
          value={localTags}
          onChange={handleTagsChange}
          availableTags={availableTags}
          readOnly={loading}
          placeholder={t('datasets.addCustomTag', '添加自定义标签...')}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 备注区域 */}
      <NoteInput
        value={localNote}
        onChange={handleNoteChange}
        readOnly={loading}
        placeholder={t('datasets.addNote', '添加备注...')}
      />

      <Divider sx={{ my: 2 }} />

      {/* 确认状态 */}
      {/* <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t('datasets.confirmationStatus')}
        </Typography>
        <Typography variant="body2">
          {conversation.confirmed ? t('datasets.confirmed') : t('datasets.unconfirmed')}
        </Typography>
      </Box> */}

      {/* AI评估 */}
      {conversation.aiEvaluation && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('datasets.aiEvaluation')}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {conversation.aiEvaluation}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}
