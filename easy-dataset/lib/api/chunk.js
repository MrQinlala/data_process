import { request } from '@/lib/util/request';

/**
 * 获取文本块
 * @param {string} projectId 项目ID
 * @param {string} chunkId 文本块ID
 * @returns
 */
export async function getChunkById(projectId, chunkId) {
  return await request(`/api/projects/${projectId}/chunks/${chunkId}`);
}
