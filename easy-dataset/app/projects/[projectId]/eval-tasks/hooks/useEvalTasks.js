'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * 评估任务列表 Hook
 */
export default function useEvalTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);

  // 加载任务列表
  const loadTasks = useCallback(
    async (isRefresh = false) => {
      if (!projectId) return;

      try {
        if (!isRefresh) setLoading(true);
        setError('');
        const response = await fetch(`/api/projects/${projectId}/eval-tasks?page=${page}&pageSize=${pageSize}`);
        const result = await response.json();

        if (result.code === 0) {
          setTasks(result.data.items || []);
          setTotal(result.data.total || 0);
        } else {
          setError(result.error || '加载失败');
        }
      } catch (err) {
        console.error('加载评估任务失败:', err);
        setError('加载失败');
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [projectId, page, pageSize]
  );

  // 初始加载和分页变化加载
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // 自动刷新进行中的任务
  useEffect(() => {
    const hasProcessingTasks = tasks.some(t => t.status === 0);
    if (!hasProcessingTasks) return;

    const interval = setInterval(() => loadTasks(true), 5000);
    return () => clearInterval(interval);
  }, [tasks, loadTasks]);

  // 删除任务
  const deleteTask = useCallback(
    async taskId => {
      try {
        const response = await fetch(`/api/projects/${projectId}/eval-tasks/${taskId}`, {
          method: 'DELETE'
        });
        const result = await response.json();

        if (result.code === 0) {
          loadTasks();
          return true;
        } else {
          setError(result.error || '删除失败');
          return false;
        }
      } catch (err) {
        console.error('删除任务失败:', err);
        setError('删除失败');
        return false;
      }
    },
    [projectId]
  );

  // 中断任务
  const interruptTask = useCallback(
    async taskId => {
      try {
        const response = await fetch(`/api/projects/${projectId}/eval-tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'interrupt' })
        });
        const result = await response.json();

        if (result.code === 0) {
          loadTasks();
          return true;
        } else {
          setError(result.error || '中断失败');
          return false;
        }
      } catch (err) {
        console.error('中断任务失败:', err);
        setError('中断失败');
        return false;
      }
    },
    [projectId, loadTasks]
  );

  // 创建任务
  const createTasks = useCallback(
    async data => {
      try {
        const response = await fetch(`/api/projects/${projectId}/eval-tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.code === 0) {
          loadTasks();
          return { success: true, data: result.data };
        } else {
          return { success: false, error: result.error };
        }
      } catch (err) {
        console.error('创建任务失败:', err);
        return { success: false, error: '创建失败' };
      }
    },
    [projectId, loadTasks]
  );

  return {
    tasks,
    loading,
    error,
    setError,
    loadTasks,
    deleteTask,
    interruptTask,
    createTasks,
    page,
    setPage,
    pageSize,
    setPageSize,
    total
  };
}
