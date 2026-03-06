const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

/**
 * 执行SQL命令
 * @param {string} dbUrl 数据库连接 URL
 * @param {string} sql SQL命令
 * @returns {Promise<void>}
 */
async function executeSql(dbUrl, sql) {
  // 允许多条SQL语句分开执行，支持分号和空行分隔
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  if (statements.length === 0) {
    return;
  }

  // 设置环境变量
  process.env.DATABASE_URL = dbUrl;

  // 创建Prisma实例
  const prisma = new PrismaClient();

  try {
    // 执行每条SQL语句
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }
  } finally {
    // 关闭连接
    await prisma.$disconnect();
  }
}

/**
 * 获取本地和应用的SQL配置文件
 * @param {string} userDataPath 用户数据目录
 * @param {string} resourcesPath 应用资源目录
 * @param {boolean} isDev 是否开发环境
 * @returns {Promise<{userSqlConfig: Array, appSqlConfig: Array}>}
 */
async function getSqlConfigs(userDataPath, resourcesPath, isDev, logger = console.log) {
  // 用户SQL配置文件路径
  const userSqlPath = path.join(userDataPath, 'sql.json');

  // 应用SQL配置文件路径
  const appSqlPath = isDev
    ? path.join(__dirname, '..', 'prisma', 'sql.json')
    : path.join(resourcesPath, 'prisma', 'sql.json');

  let userSqlConfig = [];
  let appSqlConfig = [];

  // 读取应用SQL配置
  try {
    if (fs.existsSync(appSqlPath)) {
      const appSqlContent = fs.readFileSync(appSqlPath, 'utf8');
      appSqlConfig = JSON.parse(appSqlContent);
    }
  } catch (error) {
    throw new Error(`读取应用SQL配置文件失败: ${error.message}`);
  }

  // 读取用户SQL配置（如果存在）
  try {
    if (fs.existsSync(userSqlPath)) {
      const userSqlContent = fs.readFileSync(userSqlPath, 'utf8');
      userSqlConfig = JSON.parse(userSqlContent);
    }
  } catch (error) {
    // 如果用户SQL配置不存在或无法解析，使用空数组
    userSqlConfig = [];
  }

  logger(appSqlPath);
  // logger(JSON.stringify(appSqlConfig, null, 2));
  logger(userSqlPath);
  // logger(JSON.stringify(userSqlConfig, null, 2));

  return { userSqlConfig, appSqlConfig };
}

/**
 * 更新用户SQL配置文件
 * @param {string} userDataPath 用户数据目录
 * @param {Array} sqlConfig 新的SQL配置
 */
function updateUserSqlConfig(userDataPath, sqlConfig) {
  const userSqlPath = path.join(userDataPath, 'sql.json');
  fs.writeFileSync(userSqlPath, JSON.stringify(sqlConfig, null, 4), 'utf8');
}

// 不再需要版本比较功能

/**
 * 获取需要执行的SQL命令
 * @param {Array} userSqlConfig 用户SQL配置
 * @param {Array} appSqlConfig 应用SQL配置
 * @returns {Array} 需要执行的SQL命令
 */
function getSqlsToExecute(userSqlConfig, appSqlConfig) {
  // 创建用户已执行的SQL集合 (使用 version + sql 的组合作为唯一标识)
  const userExecutedSqlSet = new Set();
  userSqlConfig.forEach(item => {
    const key = `${item.version}:${item.sql}`;
    userExecutedSqlSet.add(key);
  });

  // 过滤出用户需要执行的SQL (即应用SQL配置中存在但用户尚未执行的SQL)
  return appSqlConfig.filter(item => {
    const key = `${item.version}:${item.sql}`;
    return !userExecutedSqlSet.has(key);
  });
}

/**
 * 更新数据库
 * @param {string} userDataPath 用户数据目录
 * @param {string} resourcesPath 应用资源目录
 * @param {boolean} isDev 是否开发环境
 * @param {function} logger 日志函数
 */
async function updateDatabase(userDataPath, resourcesPath, isDev, logger = console.log) {
  const dbPath = path.join(userDataPath, 'local-db', 'db.sqlite');

  try {
    // 获取SQL配置
    const { userSqlConfig, appSqlConfig } = await getSqlConfigs(userDataPath, resourcesPath, isDev, logger);

    // 获取需要执行的SQL
    const sqlsToExecute = getSqlsToExecute(userSqlConfig, appSqlConfig);

    if (sqlsToExecute.length === 0) {
      logger('数据库已是最新版本，无需更新');
      return { updated: false, message: '数据库已是最新版本' };
    }

    // 设置数据库URL
    const dbUrl = `file:${dbPath}`;

    // 执行SQL更新
    logger(`发现 ${sqlsToExecute.length} 个数据库更新，开始执行...`);
    for (const item of sqlsToExecute) {
      try {
        logger(`执行版本 ${item.version} 的SQL更新: ${item.sql.substring(0, 100)}...`);
        await executeSql(dbUrl, item.sql);
        // 添加到用户SQL配置
        userSqlConfig.push(item);
      } catch (error) {
        logger(`执行版本 ${item.version} 的SQL更新失败: ${error.message}`);
      }
    }

    // 更新用户SQL配置文件
    updateUserSqlConfig(userDataPath, userSqlConfig);

    logger('数据库更新完成');
    return {
      updated: true,
      message: `成功执行了 ${sqlsToExecute.length} 个数据库更新`,
      executedVersions: sqlsToExecute.map(item => item.version)
    };
  } catch (error) {
    logger(`数据库更新失败: ${error.message}`);
    return { updated: false, error: error.message };
  }
}

module.exports = {
  updateDatabase,
  executeSql,
  getSqlConfigs,
  updateUserSqlConfig,
  getSqlsToExecute
};
