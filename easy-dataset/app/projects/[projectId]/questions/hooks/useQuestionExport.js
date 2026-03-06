'use client';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import axios from 'axios';

const useQuestionExport = projectId => {
  const { t } = useTranslation();

  // 导出问题集
  const exportQuestions = async exportOptions => {
    try {
      const apiUrl = `/api/projects/${projectId}/questions/export`;
      const requestBody = {
        format: exportOptions.format || 'json'
      };

      // 如果有选中的问题 ID，传递 ID 列表
      if (exportOptions.selectedIds && exportOptions.selectedIds.length > 0) {
        requestBody.selectedIds = exportOptions.selectedIds;
      }

      // 如果有筛选条件，传递筛选参数
      if (exportOptions.filters) {
        requestBody.filters = exportOptions.filters;
      }

      const response = await axios.post(apiUrl, requestBody);
      const questions = response.data;

      // 处理和下载数据
      await processAndDownloadData(questions, exportOptions);

      toast.success(t('questions.exportSuccess'));
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error.message || t('questions.exportFailed'));
      return false;
    }
  };

  // 处理和下载数据的通用函数
  const processAndDownloadData = async (data, exportOptions) => {
    const format = exportOptions.format || 'json';
    let content;
    let filename;
    let mimeType;

    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `questions-${projectId}-${timestamp}.json`;
        mimeType = 'application/json';
        break;

      case 'jsonl':
        content = data.map(item => JSON.stringify(item)).join('\n');
        filename = `questions-${projectId}-${timestamp}.jsonl`;
        mimeType = 'application/jsonl';
        break;

      case 'txt':
        content = data.map(item => item.question).join('\n\n');
        filename = `questions-${projectId}-${timestamp}.txt`;
        mimeType = 'text/plain';
        break;

      case 'csv':
        // CSV 格式
        const headers = Object.keys(data[0] || {});
        const csvRows = [headers.join(',')];
        data.forEach(item => {
          const values = headers.map(header => {
            const value = item[header] || '';
            // 处理包含逗号或引号的值
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csvRows.push(values.join(','));
        });
        content = csvRows.join('\n');
        filename = `questions-${projectId}-${timestamp}.csv`;
        mimeType = 'text/csv';
        break;

      default:
        content = JSON.stringify(data, null, 2);
        filename = `questions-${projectId}-${timestamp}.json`;
        mimeType = 'application/json';
    }

    // 创建下载链接
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    exportQuestions
  };
};

export default useQuestionExport;
