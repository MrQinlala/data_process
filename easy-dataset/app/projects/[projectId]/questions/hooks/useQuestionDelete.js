'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';

export function useQuestionDelete(projectId, onDeleteSuccess) {
  const { t } = useTranslation();

  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    content: '',
    confirmAction: null
  });

  // 执行单个问题删除
  const executeDeleteQuestion = async (questionId, selectedQuestions, setSelectedQuestions) => {
    toast.promise(axios.delete(`/api/projects/${projectId}/questions/${questionId}`), {
      loading: '数据删除中',
      success: data => {
        // 更新选中状态
        setSelectedQuestions(prev => (prev.includes(questionId) ? prev.filter(id => id !== questionId) : prev));
        // 调用成功回调
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
        return t('common.deleteSuccess');
      },
      error: error => {
        return error.response?.data?.message || '删除失败';
      }
    });
  };

  // 确认删除单个问题
  const confirmDeleteQuestion = (questionId, selectedQuestions, setSelectedQuestions) => {
    setConfirmDialog({
      open: true,
      title: t('common.confirmDelete'),
      content: t('common.confirmDeleteQuestion'),
      confirmAction: () => executeDeleteQuestion(questionId, selectedQuestions, setSelectedQuestions)
    });
  };

  // 处理删除单个问题的入口函数
  const handleDeleteQuestion = (questionId, selectedQuestions, setSelectedQuestions) => {
    confirmDeleteQuestion(questionId, selectedQuestions, setSelectedQuestions);
  };

  // 执行批量删除问题
  const executeBatchDeleteQuestions = async (selectedQuestions, setSelectedQuestions) => {
    toast.promise(
      axios.delete(`/api/projects/${projectId}/questions/batch-delete`, {
        data: { questionIds: selectedQuestions }
      }),
      {
        loading: `正在删除 ${selectedQuestions.length} 个问题...`,
        success: data => {
          // 调用成功回调
          if (onDeleteSuccess) {
            onDeleteSuccess();
          }
          // 清空选中状态
          setSelectedQuestions([]);
          return `成功删除 ${selectedQuestions.length} 个问题`;
        },
        error: error => {
          return error.response?.data?.message || '批量删除问题失败';
        }
      }
    );
  };

  // 确认批量删除问题
  const confirmBatchDeleteQuestions = (selectedQuestions, setSelectedQuestions) => {
    if (selectedQuestions.length === 0) {
      toast.warning('请先选择问题');
      return;
    }

    setConfirmDialog({
      open: true,
      title: '确认批量删除问题',
      content: `您确定要删除选中的 ${selectedQuestions.length} 个问题吗？此操作不可恢复。`,
      confirmAction: () => executeBatchDeleteQuestions(selectedQuestions, setSelectedQuestions)
    });
  };

  // 处理批量删除问题的入口函数
  const handleBatchDeleteQuestions = (selectedQuestions, setSelectedQuestions) => {
    confirmBatchDeleteQuestions(selectedQuestions, setSelectedQuestions);
  };

  // 关闭确认对话框
  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: '',
      content: '',
      confirmAction: null
    });
  };

  // 确认对话框的确认操作
  const handleConfirmAction = () => {
    closeConfirmDialog();
    if (confirmDialog.confirmAction) {
      confirmDialog.confirmAction();
    }
  };

  return {
    // 状态
    confirmDialog,

    // 方法
    handleDeleteQuestion,
    handleBatchDeleteQuestions,
    closeConfirmDialog,
    handleConfirmAction
  };
}
