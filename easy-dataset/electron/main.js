const { app, dialog, ipcMain } = require('electron');
const { setupLogging, setupIpcLogging } = require('./modules/logger');
const { createWindow, loadAppUrl, openDevTools, getMainWindow } = require('./modules/window-manager');
const { createMenu } = require('./modules/menu');
const { startNextServer } = require('./modules/server');
const { setupAutoUpdater } = require('./modules/updater');
const { initializeDatabase } = require('./modules/database');
const { clearCache } = require('./modules/cache');
const { setupIpcHandlers } = require('./modules/ipc-handlers');

// 是否是开发环境
const isDev = process.env.NODE_ENV === 'development';
const port = 1717;
let mainWindow;

// 当 Electron 完成初始化时创建窗口
app.whenReady().then(async () => {
  try {
    // 设置日志系统
    setupLogging(app);

    // 设置 IPC 处理程序
    setupIpcHandlers(app, isDev);
    setupIpcLogging(ipcMain, app, isDev);

    // 初始化数据库
    await initializeDatabase(app);

    // 创建主窗口
    mainWindow = createWindow(isDev, port);

    // 创建菜单
    createMenu(mainWindow, () => clearCache(app));

    // 在开发环境中加载 localhost URL
    if (isDev) {
      loadAppUrl(`http://localhost:${port}`);
      openDevTools();
    } else {
      // 在生产环境中启动 Next.js 服务
      const appUrl = await startNextServer(port, app);
      loadAppUrl(appUrl);
    }

    // 设置自动更新
    setupAutoUpdater(mainWindow);

    // 应用启动完成后的一段时间后自动检查更新
    setTimeout(() => {
      if (!isDev) {
        const { autoUpdater } = require('electron-updater');
        autoUpdater.checkForUpdates().catch(err => {
          console.error('Automatic update check failed:', err);
        });
      }
    }, 10000); // Check for updates after 10 seconds
  } catch (error) {
    console.error('An error occurred during application initialization:', error);
    dialog.showErrorBox(
      'Application Initialization Error',
      `An error occurred during startup, which may affect application functionality.
    Error details: ${error.message}`
    );
  }
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow(isDev, port);
  }
});

// 应用退出前清理
app.on('before-quit', () => {
  console.log('应用正在退出...');
});
