'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';

export default function useEvalDatasetDetails(projectId, evalId) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 编辑状态
  const [editingField, setEditingField] = useState(null); // 'question', 'options', 'correctAnswer', 'note', 'tags'
  const [fieldValue, setFieldValue] = useState('');
  // 获取详情
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/projects/${projectId}/eval-datasets/${evalId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('未找到该题目');
        }
        throw new Error('获取数据失败');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, evalId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 导航
  const handleNavigate = async direction => {
    try {
      const response = await fetch(`/api/projects/${projectId}/eval-datasets/${evalId}?operateType=${direction}`);
      if (response.ok) {
        const neighbor = await response.json();
        if (neighbor && neighbor.id) {
          router.push(`/projects/${projectId}/eval-datasets/${neighbor.id}`);
        } else {
          toast.warning(`已经是${direction === 'next' ? '最后' : '第'}一条数据了`);
        }
      }
    } catch (err) {
      console.error('Navigation error:', err);
    }
  };

  // 开始编辑
  const handleStartEdit = (field, value) => {
    setEditingField(field);
    // 对于 options，如果是数组则转为 JSON 字符串编辑，或者在组件层面处理
    // 这里假设 value 已经是适合编辑的格式
    setFieldValue(value);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingField(null);
    setFieldValue('');
  };

  // 保存编辑
  const handleSave = async (field, value) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/eval-datasets/${evalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });

      if (!response.ok) throw new Error('保存失败');

      const updated = await response.json();
      setData(prev => ({ ...prev, ...updated })); // 更新本地数据
      setEditingField(null);
      toast.success('保存成功');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 删除
  const handleDelete = async () => {
    if (!confirm('确定要删除这条数据吗？此操作不可撤销。')) return;

    try {
      // 先尝试获取下一条，以便删除后跳转
      const nextResponse = await fetch(`/api/projects/${projectId}/eval-datasets/${evalId}?operateType=next`);
      let nextId = null;
      if (nextResponse.ok) {
        const next = await nextResponse.json();
        if (next && next.id) nextId = next.id;
      }

      // 如果没有下一条，尝试获取上一条
      if (!nextId) {
        const prevResponse = await fetch(`/api/projects/${projectId}/eval-datasets/${evalId}?operateType=prev`);
        if (prevResponse.ok) {
          const prev = await prevResponse.json();
          if (prev && prev.id) nextId = prev.id;
        }
      }

      // 删除
      const deleteResponse = await fetch(`/api/projects/${projectId}/eval-datasets/${evalId}`, {
        method: 'DELETE'
      });

      if (!deleteResponse.ok) throw new Error('删除失败');

      toast.success('删除成功');

      if (nextId) {
        router.replace(`/projects/${projectId}/eval-datasets/${nextId}`);
      } else {
        router.push(`/projects/${projectId}/eval-datasets`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };
  return {
    data,
    loading,
    error,
    editingField,
    fieldValue,
    setFieldValue,
    handleNavigate,
    handleStartEdit,
    handleCancelEdit,
    handleSave,
    handleDelete
  };
}
