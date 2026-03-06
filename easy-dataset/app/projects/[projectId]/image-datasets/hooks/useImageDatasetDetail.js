import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function useImageDatasetDetail(projectId, datasetId) {
  const { t } = useTranslation();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 获取详情
  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/${projectId}/image-datasets/${datasetId}`);
      setDataset(response.data);
    } catch (error) {
      console.error('Failed to fetch dataset detail:', error);
      toast.error(t('imageDatasets.fetchDetailFailed', { defaultValue: '获取详情失败' }));
    } finally {
      setLoading(false);
    }
  }, [projectId, datasetId, t]);

  // 更新数据集
  const updateDataset = useCallback(
    async updates => {
      try {
        setSaving(true);
        const response = await axios.put(`/api/projects/${projectId}/image-datasets/${datasetId}`, updates);
        setDataset(response.data);
        toast.success(t('imageDatasets.updateSuccess', { defaultValue: '更新成功' }));
        return response.data;
      } catch (error) {
        console.error('Failed to update dataset:', error);
        toast.error(t('imageDatasets.updateFailed', { defaultValue: '更新失败' }));
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [projectId, datasetId, t]
  );

  // AI 重新识别
  const regenerateAnswer = useCallback(async () => {
    try {
      setSaving(true);
      const response = await axios.post(`/api/projects/${projectId}/image-datasets/${datasetId}/regenerate`);
      setDataset(response.data);
      toast.success(t('imageDatasets.regenerateSuccess', { defaultValue: 'AI 识别成功' }));
      return response.data;
    } catch (error) {
      console.error('Failed to regenerate answer:', error);
      toast.error(t('imageDatasets.regenerateFailed', { defaultValue: 'AI 识别失败' }));
      throw error;
    } finally {
      setSaving(false);
    }
  }, [projectId, datasetId, t]);

  useEffect(() => {
    if (projectId && datasetId) {
      fetchDetail();
    }
  }, [projectId, datasetId, fetchDetail]);

  return {
    dataset,
    loading,
    saving,
    updateDataset,
    regenerateAnswer,
    fetchDetail
  };
}
