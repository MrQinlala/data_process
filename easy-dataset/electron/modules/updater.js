const { autoUpdater } = require('electron-updater');
const { getAppVersion } = require('../util');

/**
 * 设置自动更新
 * @param {BrowserWindow} mainWindow 主窗口
 */
function setupAutoUpdater(mainWindow) {
  autoUpdater.autoDownload = false;
  autoUpdater.allowDowngrade = false;

  // 检查更新时出错
  autoUpdater.on('error', error => {
    if (mainWindow) {
      mainWindow.webContents.send('update-error', error.message);
    }
  });

  // 检查到更新时
  autoUpdater.on('update-available', info => {
    if (mainWindow) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes
      });
    }
  });

  // 没有可用更新
  autoUpdater.on('update-not-available', () => {
    if (mainWindow) {
      mainWindow.webContents.send('update-not-available');
    }
  });

  // 下载进度
  autoUpdater.on('download-progress', progressObj => {
    if (mainWindow) {
      mainWindow.webContents.send('download-progress', progressObj);
    }
  });

  // 下载完成
  autoUpdater.on('update-downloaded', info => {
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes
      });
    }
  });
}

/**
 * 检查更新
 * @param {boolean} isDev 是否为开发环境
 * @returns {Promise<Object>} 更新信息
 */
async function checkUpdate(isDev) {
  try {
    if (isDev) {
      // 开发环境下模拟更新检查
      return {
        hasUpdate: false,
        currentVersion: getAppVersion(),
        message: '开发环境下不检查更新'
      };
    }

    // 返回当前版本信息，并开始检查更新
    const result = await autoUpdater.checkForUpdates();
    return {
      checking: true,
      currentVersion: getAppVersion()
    };
  } catch (error) {
    console.error('检查更新失败:', error);
    return {
      hasUpdate: false,
      currentVersion: getAppVersion(),
      error: error.message
    };
  }
}

/**
 * 下载更新
 * @returns {Promise<Object>} 下载状态
 */
async function downloadUpdate() {
  try {
    autoUpdater.downloadUpdate();
    return { downloading: true };
  } catch (error) {
    console.error('下载更新失败:', error);
    return { error: error.message };
  }
}

/**
 * 安装更新
 * @returns {Object} 安装状态
 */
function installUpdate() {
  autoUpdater.quitAndInstall(false, true);
  return { installing: true };
}

module.exports = {
  setupAutoUpdater,
  checkUpdate,
  downloadUpdate,
  installUpdate
};
