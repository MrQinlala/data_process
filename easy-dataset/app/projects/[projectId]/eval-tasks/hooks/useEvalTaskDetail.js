'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * 评估任务详情 Hook
 */
export default function useEvalTaskDetail(projectId, taskId) {
  const [task, setTask] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 分页和筛选状态
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterType, setFilterType] = useState(null);
  const [filterCorrect, setFilterCorrect] = useState(null); // null: all, true: correct, false: incorrect
  const [total, setTotal] = useState(0);

  // 加载任务详情
  const loadData = useCallback(async () => {
    if (!projectId || !taskId) return;

    try {
      setLoading(true);
      setError('');

      // 构建查询参数
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      if (filterType) {
        params.append('type', filterType);
      }

      if (filterCorrect !== null) {
        params.append('isCorrect', filterCorrect.toString());
      }

      const response = await fetch(`/api/projects/${projectId}/eval-tasks/${taskId}?${params.toString()}`);
      const result = await response.json();

      if (result.code === 0) {
        setTask(result.data.task);
        setResults(result.data.results || []);
        setTotal(result.data.total || 0);
        setStats(result.data.stats);
      } else {
        setError(result.error || '加载失败');
      }
    } catch (err) {
      console.error('加载任务详情失败:', err);
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  }, [projectId, taskId, page, pageSize, filterType, filterCorrect]);

  // 初始加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 自动刷新进行中的任务 (仅在第一页且无筛选时刷新，避免干扰用户查看历史记录)
  useEffect(() => {
    if (task?.status !== 0 || page !== 1 || filterType || filterCorrect !== null) return;

    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [task?.status, page, filterType, filterCorrect, loadData]);

  return {
    task,
    results,
    stats,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    filterType,
    setFilterType,
    filterCorrect,
    setFilterCorrect,
    loading,
    error,
    setError,
    loadData
  };
}
