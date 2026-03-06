'use client';

import { Button, CircularProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAtomValue } from 'jotai/index';
import { selectedModelInfoAtom } from '@/lib/store';

/**
 * AI 生成答案按钮组件
 * @param {string} projectId - 项目ID
 * @param {string} imageName - 图片名称
 * @param {string} question - 问题内容
 * @param {function} onSuccess - 生成成功的回调，接收生成的答案
 * @param {boolean} previewOnly - 是否只预览（不保存数据集），默认 true
 * @param {object} sx - 自定义样式
 */
export default function AIGenerateButton({
  projectId,
  imageName,
  question,
  onSuccess,
  previewOnly = true,
  sx = {},
  answerType
}) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const model = useAtomValue(selectedModelInfoAtom);

  const handleGenerate = async () => {
    if (!projectId || !imageName || !question) {
      toast.error(t('images.missingParameters', { defaultValue: '缺少必要参数' }));
      return;
    }

    if (model.type !== 'vision') {
      toast.error(t('images.visionModelRequired', { defaultValue: '请选择支持视觉的模型' }));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/projects/${projectId}/images/datasets`, {
        imageName,
        question,
        model,
        language: i18n.language,
        previewOnly
      });

      if (response.data.success && response.data.answer) {
        let data = response.data.answer;
        if (answerType === 'label') {
          try {
            data = JSON.parse(response.data.answer);
          } catch {}
        }
        onSuccess(data);
        toast.success(t('images.aiGenerateSuccess', { defaultValue: 'AI 生成成功' }));
      }
    } catch (error) {
      console.error('AI 生成失败:', error);
      const errorMsg = error.response?.data?.error || t('images.aiGenerateFailed', { defaultValue: 'AI 生成失败' });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
      onClick={handleGenerate}
      disabled={loading}
      variant="outlined"
      size="small"
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 500,
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2
        },
        ...sx
      }}
    >
      {loading
        ? t('common.generating', { defaultValue: '生成中...' })
        : t('images.aiGenerate', { defaultValue: 'AI 识别' })}
    </Button>
  );
}
