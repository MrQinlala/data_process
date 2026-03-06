'use client';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import axios from 'axios';

const useImageDatasetExport = projectId => {
  const { t } = useTranslation();

  /**
   * 解析标签格式的答案
   * 如果答案是 JSON 数组格式，解析并用逗号连接
   */
  const parseAnswerLabels = item => {
    const { answer, answerType } = item;
    if (answerType !== 'label' || !answer) {
      return answer;
    }

    try {
      // 尝试解析 JSON
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed)) {
        // 如果是数组，用逗号连接
        return parsed.join(', ');
      }
      return answer;
    } catch (e) {
      // 不是 JSON 格式，直接返回原答案
      return answer;
    }
  };

  /**
   * 导出图片数据集
   */
  const exportImageDatasets = async exportOptions => {
    try {
      // 1. 获取数据集数据
      const apiUrl = `/api/projects/${projectId}/image-datasets/export`;
      const response = await axios.post(apiUrl, {
        confirmedOnly: exportOptions.confirmedOnly
      });

      let datasets = response.data;

      if (!datasets || datasets.length === 0) {
        toast.warning(t('imageDatasets.noDataToExport', '没有可导出的数据'));
        return false;
      }

      // 2. 处理答案中的标签格式
      datasets = datasets.map(item => ({
        ...item,
        answer: parseAnswerLabels(item)
      }));

      // 3. 根据格式类型转换数据
      let formattedData;

      if (exportOptions.formatType === 'raw') {
        // 原始格式：直接导出数据集
        formattedData = datasets.map(item => {
          const result = { ...item };

          // 如果需要包含图片路径
          if (exportOptions.includeImagePath && item.imageName) {
            result.image_path = `/images/${item.imageName}`;
          }

          if (item.answerType === 'custom_format') {
            try {
              result.answerObj = JSON.parse(item.answer);
            } catch {}
          }

          return result;
        });
      } else if (exportOptions.formatType === 'alpaca') {
        formattedData = datasets.map(({ question, answer, imageName }) => {
          const item = {
            instruction: question,
            input: '',
            output: answer
          };

          // 如果需要包含图片路径
          if (exportOptions.includeImagePath && imageName) {
            item.images = [`/images/${imageName}`];
          }

          return item;
        });
      } else if (exportOptions.formatType === 'sharegpt') {
        formattedData = datasets.map(({ question, answer, imageName }) => {
          const messages = [];

          // 添加系统提示词（如果有）
          if (exportOptions.systemPrompt) {
            messages.push({
              role: 'system',
              content: exportOptions.systemPrompt
            });
          }

          // 添加用户问题
          const userContent = [];

          // 如果需要包含图片路径
          if (exportOptions.includeImagePath && imageName) {
            userContent.push({
              type: 'image_url',
              image_url: {
                url: `/images/${imageName}`
              }
            });
          }

          userContent.push({
            type: 'text',
            text: question
          });

          messages.push({
            role: 'user',
            content: userContent
          });

          // 添加助手回答
          messages.push({
            role: 'assistant',
            content: answer
          });

          return { messages };
        });
      }

      // 4. 生成 JSON 文件
      const jsonContent = JSON.stringify(formattedData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const formatSuffix = exportOptions.formatType;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `image-datasets-${projectId}-${formatSuffix}-${dateStr}.json`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t('imageDatasets.exportSuccess', '数据集导出成功'));

      // 5. 如果需要导出图片，调用压缩包接口
      if (exportOptions.exportImages) {
        try {
          const params = new URLSearchParams({
            confirmedOnly: exportOptions.confirmedOnly.toString()
          });

          const zipUrl = `/api/projects/${projectId}/image-datasets/export-zip?${params.toString()}`;

          // 创建一个隐藏的 a 标签来触发下载
          const a = document.createElement('a');
          a.href = zipUrl;
          a.style.display = 'none';
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          toast.success(t('imageDatasets.exportImagesSuccess', '图片压缩包导出成功'));
        } catch (error) {
          console.error('Failed to export images:', error);
          toast.error(t('imageDatasets.exportImagesFailed', '图片导出失败'));
        }
      }

      return true;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error.message || t('imageDatasets.exportFailed', '导出失败'));
      return false;
    }
  };

  return {
    exportImageDatasets
  };
};

export default useImageDatasetExport;
