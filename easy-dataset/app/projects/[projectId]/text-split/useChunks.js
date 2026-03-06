'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * 文本块管理的自定义Hook
 * @param {string} projectId - 项目ID
 * @param {string} [currentFilter='all'] - 当前筛选条件
 * @returns {Object} - 文本块状态和操作方法
 */
export default function useChunks(projectId, currentFilter = 'all') {
  const { t } = useTranslation();
  const [chunks, setChunks] = useState([]);
  const [tocData, setTocData] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * 获取文本块列表
   * @param {string} filter - 筛选条件
   */
  const fetchChunks = useCallback(
    async (filter = 'all') => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}/split?filter=${filter}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || t('textSplit.fetchChunksFailed'));
        }

        const data = await response.json();
        setChunks(data.chunks || []);

        // 如果有文件结果，处理详细信息
        if (data.toc) {
          console.log(t('textSplit.fileResultReceived'), data.fileResult);
          // 如果有目录结构，设置目录数据
          setTocData(data.toc);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [projectId, t, setLoading, setChunks, setTocData]
  );

  /**
   * 处理删除文本块
   * @param {string} chunkId - 文本块ID
   */
  const handleDeleteChunk = useCallback(
    async chunkId => {
      try {
        const response = await fetch(`/api/projects/${projectId}/chunks/${encodeURIComponent(chunkId)}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || t('textSplit.deleteChunkFailed'));
        }

        // 更新文本块列表
        setChunks(prev => prev.filter(chunk => chunk.id !== chunkId));
      } catch (error) {
        toast.error(error.message);
      }
    },
    [projectId, t]
  );

  /**
   * 处理文本块编辑
   * @param {string} chunkId - 文本块ID
   * @param {string} newContent - 新内容
   */
  const handleEditChunk = useCallback(
    async (chunkId, newContent) => {
      try {
        setLoading(true);

        const response = await fetch(`/api/projects/${projectId}/chunks/${encodeURIComponent(chunkId)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: newContent })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || t('textSplit.editChunkFailed'));
        }

        // 更新成功后使用当前筛选条件刷新文本块列表
        // 直接从 URL 获取当前筛选参数，确保获取到的是最新的值
        const url = new URL(window.location.href);
        const filterParam = url.searchParams.get('filter') || 'all';
        await fetchChunks(filterParam);

        toast.success(t('textSplit.editChunkSuccess'));
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [projectId, t, fetchChunks]
  );

  /**
   * 设置文本块列表
   * @param {Array} data - 新的文本块列表
   */
  const updateChunks = useCallback(data => {
    setChunks(data);
  }, []);

  /**
   * 添加新的文本块
   * @param {Array} newChunks - 新的文本块列表
   */
  const addChunks = useCallback(newChunks => {
    setChunks(prev => {
      const updatedChunks = [...prev];
      newChunks.forEach(chunk => {
        if (!updatedChunks.find(c => c.id === chunk.id)) {
          updatedChunks.push(chunk);
        }
      });
      return updatedChunks;
    });
  }, []);

  /**
   * 设置TOC数据
   * @param {string} toc - TOC数据
   */
  const updateTocData = useCallback(toc => {
    if (toc) {
      setTocData(toc);
    }
  }, []);

  return {
    chunks,
    tocData,
    loading,
    fetchChunks,
    handleDeleteChunk,
    handleEditChunk,
    updateChunks,
    addChunks,
    updateTocData,
    setLoading
  };
}
