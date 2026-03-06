const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');
const { updateDatabase } = require('./db-updater');

/**
 * 清除数据库缓存
 * @param {Object} app Electron app 对象
 * @returns {Promise<boolean>} 操作是否成功
 */
async function clearDatabaseCache(app) {
  // 清理local-db目录，保留db.sqlite文件
  const localDbDir = path.join(app.getPath('userData'), 'local-db');
  if (fs.existsSync(localDbDir)) {
    // 读取目录下所有文件
    const files = await fs.promises.readdir(localDbDir);
    // 删除除了db.sqlite之外的所有文件
    for (const file of files) {
      if (file !== 'db.sqlite') {
        const filePath = path.join(localDbDir, file);
        const stat = await fs.promises.stat(filePath);
        if (stat.isFile()) {
          await fs.promises.unlink(filePath);
          global.appLog(`已删除数据库缓存文件: ${filePath}`);
        } else if (stat.isDirectory()) {
          // 如果是目录，可能需要递归删除，根据需求决定
          global.appLog(`跳过目录: ${filePath}`);
        }
      }
    }
  }
  return true;
}

/**
 * 初始化数据库
 * @param {Object} app Electron app 对象
 * @returns {Promise<Object>} 数据库配置信息
 */
async function initializeDatabase(app) {
  try {
    // 设置数据库路径
    const userDataPath = app.getPath('userData');
    const dataDir = path.join(userDataPath, 'local-db');
    const dbFilePath = path.join(dataDir, 'db.sqlite');
    const dbJSONPath = path.join(dataDir, 'db.json');
    fs.writeFileSync(path.join(process.resourcesPath, 'root-path.txt'), dataDir);

    // 确保数据目录存在
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`数据目录已创建: ${dataDir}`);
    }

    // 设置数据库连接字符串 (Prisma 格式)
    const dbConnectionString = `file:${dbFilePath}`;
    process.env.DATABASE_URL = dbConnectionString;

    // 仅在开发环境记录日志
    const logs = {
      userDataPath,
      dataDir,
      dbFilePath,
      dbConnectionString,
      dbExists: fs.existsSync(dbFilePath)
    };
    global.appLog(`数据库配置: ${JSON.stringify(logs)}`);

    if (!fs.existsSync(dbFilePath)) {
      global.appLog('数据库文件不存在，正在初始化...');

      try {
        const resourcePath =
          process.env.NODE_ENV === 'development'
            ? path.join(__dirname, '../..', 'prisma', 'template.sqlite')
            : path.join(process.resourcesPath, 'prisma', 'template.sqlite');

        const resourceJSONPath =
          process.env.NODE_ENV === 'development'
            ? path.join(__dirname, '../..', 'prisma', 'sql.json')
            : path.join(process.resourcesPath, 'prisma', 'sql.json');

        global.appLog(`resourcePath: ${resourcePath}`);

        if (fs.existsSync(resourcePath)) {
          fs.copyFileSync(resourcePath, dbFilePath);
          global.appLog(`数据库已从模板初始化: ${dbFilePath}`);
        }

        if (fs.existsSync(resourceJSONPath)) {
          fs.copyFileSync(resourceJSONPath, dbJSONPath);
          global.appLog(`数据库SQL配置已初始化: ${dbJSONPath}`);
        }
      } catch (error) {
        console.error('数据库初始化失败:', error);
        dialog.showErrorBox('数据库初始化失败', `应用无法初始化数据库，可能需要重新安装。\n错误详情: ${error.message}`);
        throw error;
      }
    } else {
      // 数据库文件存在，检查是否需要更新
      global.appLog('检查数据库是否需要更新...');
      try {
        const resourcesPath =
          process.env.NODE_ENV === 'development' ? path.join(__dirname, '../..') : process.resourcesPath;

        const isDev = process.env.NODE_ENV === 'development';

        // 更新数据库
        const result = await updateDatabase(userDataPath, resourcesPath, isDev, global.appLog);

        if (result.updated) {
          global.appLog(`数据库更新成功: ${result.message}`);
          global.appLog(`执行的版本: ${result.executedVersions.join(', ')}`);
        } else {
          global.appLog(`数据库无需更新: ${result.message}`);
        }
      } catch (error) {
        console.error('数据库更新失败:', error);
        global.appLog(`数据库更新失败: ${error.message}`, 'error');

        // 非致命错误，只提示但不阻止应用启动
        dialog.showMessageBox({
          type: 'warning',
          title: '数据库更新警告',
          message: '数据库更新过程中出现错误，部分功能可能受影响。',
          detail: `错误详情: ${error.message}\n\n您可以继续使用应用，但如果遇到问题，请重新安装应用。`,
          buttons: ['继续']
        });
      }
    }

    return {
      userDataPath,
      dataDir,
      dbFilePath,
      dbConnectionString
    };
  } catch (error) {
    console.error('初始化数据库时发生错误:', error);
    throw error;
  }
}

module.exports = {
  clearDatabaseCache,
  initializeDatabase
};
