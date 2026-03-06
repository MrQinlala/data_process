'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import request from '@/lib/util/request';
import { toast } from 'sonner';

/**
 * 测评题目生成的自定义Hook
 * @param {string} projectId - 项目ID
 * @returns {Object} - 测评题目生成状态和操作方法
 */
export default function useEvalGeneration(projectId) {
  const { t } = useTranslation();
  const [generating, setGenerating] = useState({});

  /**
   * 为单个文本块生成测评题目
   * @param {string} chunkId - 文本块ID
   * @param {Object} selectedModelInfo - 选定的模型信息
   * @param {Function} onSuccess - 成功回调
   */
  const handleGenerateEvalQuestions = useCallback(
    async (chunkId, selectedModelInfo, onSuccess) => {
      try {
        // 检查模型信息
        if (!selectedModelInfo) {
          throw new Error(t('textSplit.selectModelFirst'));
        }

        // 设置生成状态
        setGenerating(prev => ({ ...prev, [chunkId]: true }));

        // 获取当前语言环境
        const currentLanguage = i18n.language === 'zh-CN' ? 'zh-CN' : 'en';

        // 调用API生成测评题目
        const response = await request(
          `/api/projects/${projectId}/chunks/${encodeURIComponent(chunkId)}/eval-questions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: selectedModelInfo,
              language: currentLanguage
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || t('textSplit.generateEvalQuestionsFailed'));
        }

        const data = await response.json();

        // 显示成功消息
        toast.success(
          t('textSplit.evalQuestionsGeneratedSuccess', {
            total: data.total,
            defaultValue: `成功生成 ${data.total} 道测评题目`
          })
        );

        // 调用成功回调
        if (onSuccess) {
          onSuccess(data);
        }
      } catch (error) {
        console.error('Error generating eval questions:', error);
        toast.error(error.message || t('textSplit.generateEvalQuestionsFailed'));
      } finally {
        // 清除生成状态
        setGenerating(prev => {
          const newState = { ...prev };
          delete newState[chunkId];
          return newState;
        });
      }
    },
    [projectId, t]
  );

  return {
    generating,
    handleGenerateEvalQuestions
  };
}
