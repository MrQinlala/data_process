'use client';

import { useState, useEffect } from 'react';

/**
 * 数据集筛选条件持久化 Hook
 * 负责筛选条件的保存、恢复和管理
 * @param {string} projectId - 项目ID
 * @returns {Object} 筛选条件和相关方法
 */
export function useDatasetFilters(projectId) {
  const [filterConfirmed, setFilterConfirmed] = useState('all');
  const [filterHasCot, setFilterHasCot] = useState('all');
  const [filterIsDistill, setFilterIsDistill] = useState('all');
  const [filterScoreRange, setFilterScoreRange] = useState([0, 5]);
  const [filterCustomTag, setFilterCustomTag] = useState('');
  const [filterNoteKeyword, setFilterNoteKeyword] = useState('');
  const [filterChunkName, setFilterChunkName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('question');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isInitialized, setIsInitialized] = useState(false);

  // 从 localStorage 恢复筛选条件
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedFilters = localStorage.getItem(`datasets-filters-${projectId}`);
        if (savedFilters) {
          const filters = JSON.parse(savedFilters);
          setFilterConfirmed(filters.filterConfirmed || 'all');
          setFilterHasCot(filters.filterHasCot || 'all');
          setFilterIsDistill(filters.filterIsDistill || 'all');
          setFilterScoreRange(filters.filterScoreRange || [0, 5]);
          setFilterCustomTag(filters.filterCustomTag || '');
          setFilterNoteKeyword(filters.filterNoteKeyword || '');
          setFilterChunkName(filters.filterChunkName || '');
          setSearchQuery(filters.searchQuery || '');
          setSearchField(filters.searchField || 'question');
          setPage(filters.page || 1);
          setRowsPerPage(filters.rowsPerPage || 10);
        }
      } catch (error) {
        console.error('恢复筛选条件失败:', error);
      }
      setIsInitialized(true);
    }
  }, [projectId]);

  // 保存筛选条件到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        const filters = {
          filterConfirmed,
          filterHasCot,
          filterIsDistill,
          filterScoreRange,
          filterCustomTag,
          filterNoteKeyword,
          filterChunkName,
          searchQuery,
          searchField,
          page,
          rowsPerPage
        };
        localStorage.setItem(`datasets-filters-${projectId}`, JSON.stringify(filters));
      } catch (error) {
        console.error('保存筛选条件失败:', error);
      }
    }
  }, [
    projectId,
    filterConfirmed,
    filterHasCot,
    filterIsDistill,
    filterScoreRange,
    filterCustomTag,
    filterNoteKeyword,
    filterChunkName,
    searchQuery,
    searchField,
    page,
    rowsPerPage,
    isInitialized
  ]);

  /**
   * 重置所有筛选条件为默认值
   */
  const resetFilters = () => {
    setFilterConfirmed('all');
    setFilterHasCot('all');
    setFilterIsDistill('all');
    setFilterScoreRange([0, 5]);
    setFilterCustomTag('');
    setFilterNoteKeyword('');
    setFilterChunkName('');
    setSearchQuery('');
    setSearchField('question');
    setPage(1);
    setRowsPerPage(10);
  };

  /**
   * 清除 localStorage 中的筛选条件
   */
  const clearSavedFilters = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`datasets-filters-${projectId}`);
      } catch (error) {
        console.error('清除筛选条件失败:', error);
      }
    }
  };

  /**
   * 计算当前活跃的筛选条件数量
   * @returns {number} 活跃筛选条件的数量
   */
  const getActiveFilterCount = () => {
    let count = 0;

    if (filterConfirmed !== 'all') count++;
    if (filterHasCot !== 'all') count++;
    if (filterIsDistill !== 'all') count++;
    if (filterScoreRange[0] > 0 || filterScoreRange[1] < 5) count++;
    if (filterCustomTag) count++;
    if (filterNoteKeyword) count++;
    if (filterChunkName) count++;

    return count;
  };

  return {
    // 筛选条件状态
    filterConfirmed,
    setFilterConfirmed,
    filterHasCot,
    setFilterHasCot,
    filterIsDistill,
    setFilterIsDistill,
    filterScoreRange,
    setFilterScoreRange,
    filterCustomTag,
    setFilterCustomTag,
    filterNoteKeyword,
    setFilterNoteKeyword,
    filterChunkName,
    setFilterChunkName,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    // 分页状态
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    // 初始化状态
    isInitialized,
    // 工具方法
    resetFilters,
    clearSavedFilters,
    getActiveFilterCount
  };
}

export default useDatasetFilters;
