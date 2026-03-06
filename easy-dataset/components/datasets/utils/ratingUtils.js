/**
 * 评分相关的工具函数
 */

/**
 * 根据评分获取对应的颜色和标签（不包含国际化）
 * @param {number} score - 评分 (0-5)
 * @returns {object} - 包含颜色、背景色和标签的对象
 */
export const getRatingConfig = score => {
  if (score >= 4.5) {
    return {
      color: '#2e7d32', // 深绿色
      backgroundColor: '#e8f5e8',
      label: '优秀',
      variant: 'excellent'
    };
  } else if (score >= 3.5) {
    return {
      color: '#388e3c', // 绿色
      backgroundColor: '#f1f8e9',
      label: '良好',
      variant: 'good'
    };
  } else if (score >= 2.5) {
    return {
      color: '#f57c00', // 橙色
      backgroundColor: '#fff3e0',
      label: '一般',
      variant: 'average'
    };
  } else if (score >= 1.5) {
    return {
      color: '#f44336', // 红色
      backgroundColor: '#ffebee',
      label: '较差',
      variant: 'poor'
    };
  } else if (score > 0) {
    return {
      color: '#d32f2f', // 深红色
      backgroundColor: '#ffebee',
      label: '很差',
      variant: 'very-poor'
    };
  } else {
    return {
      color: '#757575', // 灰色
      backgroundColor: '#f5f5f5',
      label: '未评分',
      variant: 'unrated'
    };
  }
};

/**
 * 根据评分获取对应的颜色和国际化标签
 * @param {number} score - 评分 (0-5)
 * @param {function} t - 国际化翻译函数
 * @returns {object} - 包含颜色、背景色和国际化标签的对象
 */
export const getRatingConfigI18n = (score, t) => {
  const baseConfig = getRatingConfig(score);

  // 根据variant获取对应的翻译键
  let translationKey;
  let fallbackText;

  switch (baseConfig.variant) {
    case 'excellent':
      translationKey = 'datasets.ratingExcellent';
      fallbackText = '优秀';
      break;
    case 'good':
      translationKey = 'datasets.ratingGood';
      fallbackText = '良好';
      break;
    case 'average':
      translationKey = 'datasets.ratingAverage';
      fallbackText = '一般';
      break;
    case 'poor':
      translationKey = 'datasets.ratingPoor';
      fallbackText = '较差';
      break;
    case 'very-poor':
      translationKey = 'datasets.ratingVeryPoor';
      fallbackText = '很差';
      break;
    case 'unrated':
      translationKey = 'datasets.ratingUnrated';
      fallbackText = '未评分';
      break;
    default:
      translationKey = 'datasets.ratingUnrated';
      fallbackText = '未评分';
  }

  return {
    ...baseConfig,
    label: t(translationKey, fallbackText)
  };
};

/**
 * 格式化评分显示
 * @param {number} score - 评分
 * @returns {string} - 格式化后的评分字符串
 */
export const formatScore = score => {
  if (score === 0) return '';
  return score.toFixed(1);
};

/**
 * 获取评分范围的描述
 * @param {number} score - 评分
 * @returns {string} - 评分范围描述
 */
export const getScoreDescription = score => {
  const config = getRatingConfig(score);
  return `${formatScore(score)} - ${config.label}`;
};

/**
 * 评分范围常量
 */
export const SCORE_RANGES = {
  EXCELLENT: { min: 4.5, max: 5.0, label: '优秀' },
  GOOD: { min: 3.5, max: 4.4, label: '良好' },
  AVERAGE: { min: 2.5, max: 3.4, label: '一般' },
  POOR: { min: 1.5, max: 2.4, label: '较差' },
  VERY_POOR: { min: 0.1, max: 1.4, label: '很差' },
  UNRATED: { min: 0, max: 0, label: '未评分' }
};
