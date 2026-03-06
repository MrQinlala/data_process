const path = require('path');
const fs = require('fs');

// 获取应用版本
const getAppVersion = () => {
  try {
    const packageJsonPath = path.join(__dirname, '../package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version;
    }
    return '1.0.0';
  } catch (error) {
    console.error('读取版本信息失败:', error);
    return '1.0.0';
  }
};

module.exports = { getAppVersion };
