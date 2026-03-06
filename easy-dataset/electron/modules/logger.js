const fs = require('fs');
const path = require('path');

/**
 * 设置应用日志系统
 * @param {Object} app Electron app 对象
 * @returns {string} 日志文件路径
 */
function setupLogging(app) {
  const logDir = path.join(app.getPath('userData'), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFilePath = path.join(logDir, `app-${new Date().toISOString().slice(0, 10)}.log`);

  // 创建自定义日志函数
  global.appLog = (message, level = 'info') => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    // 同时输出到控制台和日志文件
    console.log(message);
    fs.appendFileSync(logFilePath, logEntry);
  };

  // 捕获全局未处理异常并记录
  process.on('uncaughtException', error => {
    global.appLog(`未捕获的异常: ${error.stack || error}`, 'error');
  });

  return logFilePath;
}

/**
 * 设置 IPC 日志处理程序
 * @param {Object} ipcMain IPC 主进程对象
 * @param {Object} app Electron app 对象
 * @param {boolean} isDev 是否为开发环境
 */
function setupIpcLogging(ipcMain, app, isDev) {
  ipcMain.on('log', (event, { level, message }) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    // 只在客户端环境下写入文件
    if (!isDev || true) {
      const logsDir = path.join(app.getPath('userData'), 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
      fs.appendFileSync(logFile, logEntry);
    }

    // 同时输出到控制台
    console[level](message);
  });
}

/**
 * 清理日志文件
 * @param {Object} app Electron app 对象
 * @returns {Promise<void>}
 */
async function clearLogs(app) {
  const logsDir = path.join(app.getPath('userData'), 'logs');
  if (fs.existsSync(logsDir)) {
    // 读取目录下所有文件
    const files = await fs.promises.readdir(logsDir);
    // 删除所有文件
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      await fs.promises.unlink(filePath);
      global.appLog(`已删除日志文件: ${filePath}`);
    }
  }
}

module.exports = {
  setupLogging,
  setupIpcLogging,
  clearLogs
};
