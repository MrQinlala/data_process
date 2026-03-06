const { ipcMain } = require('electron');
const { checkUpdate, downloadUpdate, installUpdate } = require('./updater');

/**
 * 设置 IPC 处理程序
 * @param {Object} app Electron app 对象
 * @param {boolean} isDev 是否为开发环境
 */
function setupIpcHandlers(app, isDev) {
  // 获取用户数据路径
  ipcMain.on('get-user-data-path', event => {
    event.returnValue = app.getPath('userData');
  });

  // 检查更新
  ipcMain.handle('check-update', async () => {
    return await checkUpdate(isDev);
  });

  // 下载更新
  ipcMain.handle('download-update', async () => {
    return await downloadUpdate();
  });

  // 安装更新
  ipcMain.handle('install-update', () => {
    return installUpdate();
  });
}

module.exports = {
  setupIpcHandlers
};
