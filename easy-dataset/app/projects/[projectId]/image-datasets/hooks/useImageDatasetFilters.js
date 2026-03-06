import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'imageDatasetFilters';

export function useImageDatasetFilters(projectId) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState([0, 5]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 从 localStorage 恢复筛选条件
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${projectId}`);
      if (stored) {
        const filters = JSON.parse(stored);
        setSearchQuery(filters.searchQuery || '');
        setStatusFilter(filters.statusFilter || 'all');
        setScoreFilter(filters.scoreFilter || [0, 5]);
      }
    } catch (error) {
      console.error('Failed to restore filters:', error);
    }
    setIsInitialized(true);
  }, [projectId]);

  // 保存筛选条件到 localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(
          `${STORAGE_KEY}_${projectId}`,
          JSON.stringify({
            searchQuery,
            statusFilter,
            scoreFilter
          })
        );
      } catch (error) {
        console.error('Failed to save filters:', error);
      }
    }
  }, [projectId, searchQuery, statusFilter, scoreFilter, isInitialized]);

  // 计算活跃筛选条件数
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (scoreFilter[0] > 0 || scoreFilter[1] < 5) count++;
    return count;
  }, [statusFilter, scoreFilter]);

  // 重置筛选条件
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setScoreFilter([0, 5]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    scoreFilter,
    setScoreFilter,
    isInitialized,
    getActiveFilterCount,
    resetFilters
  };
}
