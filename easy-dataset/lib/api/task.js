import { request } from '@/lib/util/request';

/**
 * 获取项目任务
 */
export function getProjectTasks(projectId) {
  return request(`/api/projects/${projectId}/tasks`);
}
