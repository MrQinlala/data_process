/**
 * 文件操作辅助函数
 */
const path = require('path');
const { promises: fs } = require('fs');
const { getProjectRoot, readJSON } = require('./base');
const { getProject } = require('./projects');
const { getUploadFileInfoById } = require('./upload-files');

/**
 * 获取项目文件内容
 * @param {string} projectId - 项目ID
 * @param {string} fileName - 文件名
 * @returns {Promise<string>} 文件内容
 */
async function getProjectFileContent(projectId, fileName) {
  try {
    // 获取项目根目录
    const projectRoot = await getProjectRoot();
    const projectPath = path.join(projectRoot, projectId);
    const filePath = path.join(projectPath, 'files', fileName);

    // 读取文件内容
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('获取项目文件内容失败:', error);
    return '';
  }
}

/**
 * 根据文件ID获取项目文件内容
 * @param {string} projectId - 项目ID
 * @param {string} fileId - 文件ID
 * @returns {Promise<string>} 文件内容
 */
async function getProjectFileContentById(projectId, fileId) {
  try {
    // 获取文件信息
    const fileInfo = await getUploadFileInfoById(fileId);
    if (!fileInfo) {
      throw new Error('文件不存在');
    }

    // 获取项目根目录
    const projectRoot = await getProjectRoot();
    const projectPath = path.join(projectRoot, projectId);
    const filePath = path.join(projectPath, 'files', fileInfo.fileName);

    // 读取文件内容
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('根据ID获取项目文件内容失败:', error);
    return '';
  }
}

module.exports = {
  getProjectFileContent,
  getProjectFileContentById
};
