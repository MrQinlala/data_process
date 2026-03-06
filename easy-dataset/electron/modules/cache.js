const { clearLogs } = require('./logger');
const { clearDatabaseCache } = require('./database');

/**
 * 清除缓存函数 - 清理logs和local-db目录
 * @param {Object} app Electron app 对象
 * @returns {Promise<boolean>} 操作是否成功
 */
async function clearCache(app) {
  // 清理日志目录
  await clearLogs(app);

  // 清理数据库缓存
  await clearDatabaseCache(app);

  return true;
}

module.exports = {
  clearCache
};
