import i18n from '@/lib/i18n';
import { request } from '@/lib/util/request';

/**
 * 上传文件
 * @param {File} file 文件
 * @param {string} projectId 项目ID
 * @param {string} fileContent 文件内容
 * @param {string} fileName 文件名
 * @param {function} t 国际化函数
 * @returns
 */
export async function uploadFile({ file, projectId, fileContent, fileName, t }) {
  return await request(`/api/projects/${projectId}/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'x-file-name': encodeURIComponent(fileName)
    },
    body: file.name.endsWith('.docx') ? new TextEncoder().encode(fileContent) : fileContent,
    errMsg: t('textSplit.uploadFailed')
  });
}

/**
 * 删除文件
 * @param {Object} fileToDelete 文件信息
 * @param {string} projectId 项目ID
 * @param {string} domainTreeActionType 域树处理方式
 * @param {Object} modelInfo 模型信息
 * @returns
 */
export async function deleteFile({ fileToDelete, projectId, domainTreeActionType, modelInfo }) {
  return await request(
    `/api/projects/${projectId}/files?fileId=${fileToDelete.fileId}&domainTreeAction=${domainTreeActionType || 'keep'}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelInfo,
        language: i18n.language === 'zh-CN' ? '中文' : 'en'
      })
    }
  );
}

/**
 * 获取文件列表
 * @param {string} projectId 项目ID
 * @param {number} page 页码
 * @param {number} size 每页大小
 * @param {string} fileName 搜索文件名（可选）
 */
export async function getFiles({ projectId, page, size, fileName }) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: size.toString()
  });

  if (fileName && fileName.trim()) {
    params.append('fileName', fileName.trim());
  }

  return await request(`/api/projects/${projectId}/files?${params}`);
}
