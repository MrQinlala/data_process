'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Divider, Paper, Button, Stack } from '@mui/material';
import { toast } from 'sonner';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import StarRating from './StarRating';
import TagSelector from './TagSelector';
import NoteInput from './NoteInput';
import EvalVariantDialog from './EvalVariantDialog';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { selectedModelInfoAtom } from '@/lib/store';

/**
 * 数据集评分、标签、备注综合组件
 */
export default function DatasetRatingSection({ dataset, projectId, onUpdate, currentDataset }) {
  const { t, i18n } = useTranslation();
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingToEval, setAddingToEval] = useState(false);
  const [generatingVariant, setGeneratingVariant] = useState(false);
  const [variantDialog, setVariantDialog] = useState({
    open: false,
    data: null
  });

  const selectedModel = useAtomValue(selectedModelInfoAtom);

  // 解析数据集中的标签
  const parseDatasetTags = tagsString => {
    try {
      return JSON.parse(tagsString || '[]');
    } catch (e) {
      return [];
    }
  };

  // 本地状态管理，从 props 初始化
  const [localScore, setLocalScore] = useState(dataset.score || 0);
  const [localTags, setLocalTags] = useState(() => parseDatasetTags(dataset.tags));
  const [localNote, setLocalNote] = useState(dataset.note || '');

  // 获取项目中已使用的标签
  useEffect(() => {
    const fetchAvailableTags = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/datasets/tags`);
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

  // 同步props中的dataset到本地状态
  useEffect(() => {
    setLocalScore(dataset.score || 0);
    setLocalTags(parseDatasetTags(dataset.tags));
    setLocalNote(dataset.note || '');
  }, [dataset]);

  // 更新数据集元数据
  const updateMetadata = async updates => {
    if (loading) return;

    // 立即更新本地状态，提升响应速度
    if (updates.score !== undefined) {
      setLocalScore(updates.score);
    }
    if (updates.tags !== undefined) {
      setLocalTags(updates.tags);
    }
    if (updates.note !== undefined) {
      setLocalNote(updates.note);
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/datasets/${dataset.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('更新失败');
      }

      const result = await response.json();

      // 显示成功提示
      toast.success(t('datasets.updateSuccess', '更新成功'));

      // 如果有父组件的更新回调，调用它
      if (onUpdate) {
        onUpdate(result.dataset);
      }
    } catch (error) {
      console.error('更新数据集元数据失败:', error);
      // 显示错误提示
      toast.error(t('datasets.updateFailed', '更新失败'));

      // 出错时恢复本地状态
      if (updates.score !== undefined) {
        setLocalScore(dataset.score || 0);
      }
      if (updates.tags !== undefined) {
        setLocalTags(parseDatasetTags(dataset.tags));
      }
      if (updates.note !== undefined) {
        setLocalNote(dataset.note || '');
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
    updateMetadata({ tags: newTags });
  };

  // 处理备注变更
  const handleNoteChange = newNote => {
    updateMetadata({ note: newNote });
  };

  // 添加到评估数据集
  const handleAddToEval = async () => {
    if (addingToEval) return;

    setAddingToEval(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/datasets/${dataset.id}/copy-to-eval`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to add to eval dataset');
      }

      toast.success(t('datasets.addToEvalSuccess', '成功添加到评估数据集'));

      // 更新本地标签显示
      const currentTags = localTags || [];
      if (!currentTags.includes('Eval')) {
        setLocalTags([...currentTags, 'Eval']);
      }
    } catch (error) {
      console.error('添加评估数据集失败:', error);
      toast.error(t('datasets.addToEvalFailed', '添加失败'));
    } finally {
      setAddingToEval(false);
    }
  };

  // 生成评估集变体
  const handleGenerateEvalVariant = async config => {
    if (!selectedModel) {
      toast.error(t('datasets.selectModelFirst', '请先选择模型'));
      throw new Error('No model selected');
    }

    try {
      const language = i18n.language === 'zh-CN' ? 'zh-CN' : 'en';
      const response = await fetch(`/api/projects/${projectId}/datasets/generate-eval-variant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          datasetId: dataset.id,
          model: selectedModel,
          language,
          questionType: config.questionType,
          count: config.count
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate variant');
      }

      const { data } = await response.json();

      // 为每个生成的项添加题型信息，以便保存时使用
      return Array.isArray(data) ? data.map(item => ({ ...item, questionType: config.questionType })) : [];
    } catch (error) {
      console.error('生成变体失败:', error);
      toast.error(t('datasets.generateVariantFailed', '生成变体失败'));
      throw error;
    }
  };

  // 保存评估集变体
  const handleSaveEvalVariant = async variantItems => {
    try {
      // 过滤掉 'Eval' 标签，并确保转为逗号分隔的字符串
      const tagsToSync = (localTags || []).filter(tag => tag !== 'Eval').join(',');

      const itemsToSave = variantItems.map(item => ({
        question: item.question,
        correctAnswer: item.correctAnswer,
        questionType: item.questionType || 'open_ended',
        options: item.options,
        tags: tagsToSync,
        note: dataset.note,
        chunkId: null // 变体暂时不关联原始文本块
      }));

      const response = await fetch(`/api/projects/${projectId}/eval-datasets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: itemsToSave })
      });

      if (!response.ok) {
        throw new Error('Failed to save eval dataset');
      }

      const result = await response.json();
      toast.success(t('datasets.saveVariantSuccess', '已保存到评估数据集'));

      // 关闭对话框
      setVariantDialog({ open: false, data: null });
    } catch (error) {
      console.error('保存变体失败:', error);
      toast.error(t('datasets.saveVariantFailed', '保存失败'));
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      {/* 评分区域 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          {t('datasets.rating', '评分')}
        </Typography>
        <StarRating value={localScore} onChange={handleScoreChange} readOnly={loading} />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 标签区域 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          {t('datasets.customTags', '自定义标签')}
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
      <Button
        variant="contained"
        color="primary"
        startIcon={<PlaylistAddIcon />}
        onClick={handleAddToEval}
        disabled={addingToEval}
        sx={{ py: 1, flex: 1 }}
      >
        {addingToEval ? t('common.processing') : t('datasets.addToEval')}
      </Button>
      <Divider sx={{ my: 2 }} />
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<AutoFixHighIcon />}
        onClick={() => setVariantDialog({ open: true, data: null })}
        disabled={loading}
        sx={{ py: 1, flex: 1 }}
      >
        {t('datasets.generateEvalVariant')}
      </Button>

      <Divider sx={{ my: 2 }} />

      {currentDataset.aiEvaluation && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom color="primary">
            {t('datasets.aiEvaluation')}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {currentDataset.aiEvaluation}
          </Typography>
        </Paper>
      )}

      <EvalVariantDialog
        open={variantDialog.open}
        onClose={() => setVariantDialog({ open: false, data: null })}
        onGenerate={handleGenerateEvalVariant}
        onSave={handleSaveEvalVariant}
      />
    </Paper>
  );
}
