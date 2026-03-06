'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

/**
 * 多轮对话详情页面的状态管理Hook
 */
export default function useConversationDetails(projectId, conversationId) {
  const { t } = useTranslation();
  const router = useRouter();

  // 基础状态
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // 编辑状态
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    score: 0,
    tags: '',
    note: '',
    confirmed: false,
    messages: []
  });

  // 对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 获取对话详情
  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/dataset-conversations/${conversationId}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error(t('datasets.conversationNotFound'));
          router.push(`/projects/${projectId}/multi-turn`);
          return;
        }
        throw new Error(t('datasets.fetchDataFailed'));
      }

      const data = await response.json();
      setConversation(data);

      // 解析对话消息
      let parsedMessages = [];
      try {
        parsedMessages = JSON.parse(data.rawMessages || '[]');
        setMessages(parsedMessages);
      } catch (error) {
        console.error('解析对话消息失败:', error);
        setMessages([]);
      }

      // 设置编辑数据
      setEditData({
        score: data.score || 0,
        tags: data.tags || '',
        note: data.note || '',
        confirmed: data.confirmed || false,
        messages: parsedMessages
      });
    } catch (error) {
      console.error('获取对话详情失败:', error);
      toast.error(error.message || t('datasets.fetchDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 保存编辑
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/projects/${projectId}/dataset-conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score: editData.score,
          tags: editData.tags,
          note: editData.note,
          confirmed: editData.confirmed,
          messages: editData.messages
        })
      });

      if (!response.ok) {
        throw new Error(t('datasets.saveFailed'));
      }

      // 更新本地状态
      setConversation({ ...conversation, ...editData });
      setMessages(editData.messages);
      setEditMode(false);
      toast.success(t('datasets.saveSuccess'));
    } catch (error) {
      console.error('保存失败:', error);
      toast.error(error.message || t('datasets.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  // 开始编辑
  const handleEdit = () => {
    setEditMode(true);
  };

  // 取消编辑
  const handleCancel = () => {
    // 恢复到原始数据
    setEditData({
      score: conversation.score || 0,
      tags: conversation.tags || '',
      note: conversation.note || '',
      confirmed: conversation.confirmed || false,
      messages: messages
    });
    setEditMode(false);
  };

  // 删除对话
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/dataset-conversations/${conversationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(t('datasets.deleteFailed'));
      }

      toast.success(t('datasets.deleteSuccess'));
      router.push(`/projects/${projectId}/multi-turn`);
    } catch (error) {
      console.error('删除失败:', error);
      toast.error(error.message || t('datasets.deleteFailed'));
    }
  };

  // 更新消息内容
  const updateMessageContent = (index, newContent) => {
    const updatedMessages = [...editData.messages];
    updatedMessages[index] = { ...updatedMessages[index], content: newContent };
    setEditData({ ...editData, messages: updatedMessages });
  };

  // 翻页导航
  const handleNavigate = async direction => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/dataset-conversations/${conversationId}?operateType=${direction}`
      );

      if (!response.ok) {
        throw new Error('获取导航数据失败');
      }

      const data = await response.json();

      if (data) {
        router.push(`/projects/${projectId}/multi-turn/${data.id}`);
      } else {
        toast.warning(`已经是${direction === 'next' ? '最后' : '第'}一条对话了`);
      }
    } catch (error) {
      console.error('导航失败:', error);
      toast.error(error.message || '导航失败');
    }
  };

  // 初始化
  useEffect(() => {
    fetchConversation();
  }, [projectId, conversationId]);

  return {
    // 数据状态
    conversation,
    messages,
    loading,

    // 编辑状态
    editMode,
    saving,
    editData,
    setEditData,

    // 对话框状态
    deleteDialogOpen,
    setDeleteDialogOpen,

    // 操作方法
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleNavigate,
    updateMessageContent,
    fetchConversation
  };
}
