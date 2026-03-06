'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * 评估数据集导出 Hook
 * 管理导出对话框状态、筛选条件和导出逻辑
 */
export default function useExportEvalDatasets(projectId, stats = {}) {
  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  // 导出配置
  const [format, setFormat] = useState('json');
  const [questionTypes, setQuestionTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [keyword, setKeyword] = useState('');

  // 预览数据
  const [previewTotal, setPreviewTotal] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);

  // 从 stats 中获取可用的标签列表
  const availableTags = stats?.byTag ? Object.keys(stats.byTag).sort() : [];

  // 当筛选条件变化时，获取预览数量
  useEffect(() => {
    if (!dialogOpen || !projectId) return;

    const controller = new AbortController();

    const fetchPreview = async () => {
      try {
        setPreviewLoading(true);
        const params = new URLSearchParams();

        if (questionTypes.length > 0) {
          questionTypes.forEach(t => params.append('questionTypes', t));
        }
        if (selectedTags.length > 0) {
          selectedTags.forEach(t => params.append('tags', t));
        }
        if (keyword.trim()) {
          params.append('keyword', keyword.trim());
        }

        const response = await fetch(`/api/projects/${projectId}/eval-datasets/export?${params.toString()}`, {
          signal: controller.signal
        });

        if (response.ok) {
          const result = await response.json();
          setPreviewTotal(result?.data?.total ?? 0);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('获取导出预览失败:', err);
        }
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();

    return () => {
      controller.abort();
    };
  }, [dialogOpen, projectId, questionTypes, selectedTags, keyword]);

  // 打开对话框
  const openDialog = useCallback(() => {
    setDialogOpen(true);
    setError('');
  }, []);

  // 关闭对话框
  const closeDialog = useCallback(() => {
    if (exporting) return;
    setDialogOpen(false);
    // 重置状态
    setFormat('json');
    setQuestionTypes([]);
    setSelectedTags([]);
    setKeyword('');
    setError('');
  }, [exporting]);

  // 重置筛选条件
  const resetFilters = useCallback(() => {
    setQuestionTypes([]);
    setSelectedTags([]);
    setKeyword('');
  }, []);

  // 执行导出
  const handleExport = useCallback(async () => {
    if (previewTotal === 0) {
      setError('没有符合条件的数据可导出');
      return;
    }

    try {
      setExporting(true);
      setError('');

      const response = await fetch(`/api/projects/${projectId}/eval-datasets/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          questionTypes,
          tags: selectedTags,
          keyword: keyword.trim()
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '导出失败');
      }

      // 获取文件名
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `eval-datasets-${Date.now()}.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) {
          filename = match[1];
        }
      }

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // 导出成功，关闭对话框
      closeDialog();

      return true;
    } catch (err) {
      console.error('导出失败:', err);
      setError(err.message || '导出失败');
      return false;
    } finally {
      setExporting(false);
    }
  }, [projectId, format, questionTypes, selectedTags, keyword, previewTotal, closeDialog]);

  return {
    // 对话框状态
    dialogOpen,
    openDialog,
    closeDialog,

    // 导出状态
    exporting,
    error,
    setError,

    // 导出配置
    format,
    setFormat,
    questionTypes,
    setQuestionTypes,
    selectedTags,
    setSelectedTags,
    keyword,
    setKeyword,

    // 预览数据
    previewTotal,
    previewLoading,
    availableTags,

    // 操作
    resetFilters,
    handleExport
  };
}
