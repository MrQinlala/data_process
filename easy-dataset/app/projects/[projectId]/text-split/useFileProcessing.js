'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { selectedModelInfoAtom } from '@/lib/store';
import { useAtomValue } from 'jotai/index';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';
import axios from 'axios';

/**
 * 文件处理的自定义Hook
 * @param {string} projectId - 项目ID
 * @returns {Object} - 文件处理状态和操作方法
 */
export default function useFileProcessing(projectId) {
  const { t } = useTranslation();
  const [fileProcessing, setFileProcessing] = useState(false);
  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
    percentage: 0,
    questionCount: 0
  });
  const model = useAtomValue(selectedModelInfoAtom);

  /**
   * 重置进度状态
   */
  const resetProgress = useCallback(() => {
    setTimeout(() => {
      setProgress({
        total: 0,
        completed: 0,
        percentage: 0,
        questionCount: 0
      });
    }, 1000); // 延迟重置，让用户看到完成的进度
  }, []);

  /**
   * 处理文件
   * @param {Array} files - 文件列表
   * @param {string} pdfStrategy - PDF处理策略
   * @param {string} selectedViosnModel - 选定的视觉模型
   */
  const handleFileProcessing = useCallback(
    async (files, pdfStrategy, selectedViosnModel, domainTreeAction) => {
      try {
        const currentLanguage = i18n.language === 'zh-CN' ? '中文' : 'en';

        //获取到视觉策略要使用的模型
        const availableModels = JSON.parse(localStorage.getItem('modelConfigList'));
        const vsionModel = availableModels.find(m => m.id === selectedViosnModel);

        const response = await axios.post(`/api/projects/${projectId}/tasks`, {
          taskType: 'file-processing',
          modelInfo: model,
          language: currentLanguage,
          detail: '文件处理任务',
          note: {
            vsionModel,
            projectId,
            fileList: files,
            strategy: pdfStrategy,
            domainTreeAction
          }
        });

        if (response.data?.code !== 0) {
          throw new Error(t('textSplit.pdfProcessingFailed') + (response.data?.error || ''));
        }

        //提示后台任务进行中
        toast.success(t('textSplit.pdfProcessingToast'));
      } catch (error) {
        toast.error(t('textSplit.pdfProcessingFailed') + error.message || '');
      }
    },
    [projectId, t, resetProgress, model]
  );

  return {
    fileProcessing,
    progress,
    setFileProcessing,
    setProgress,
    handleFileProcessing,
    resetProgress
  };
}
