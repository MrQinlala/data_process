'use client';

/**
 * 按照标签前面的序号对标签进行排序
 * @param {Array} tags - 标签数组
 * @returns {Array} 排序后的标签数组
 */
export const sortTagsByNumber = tags => {
  return [...tags].sort((a, b) => {
    // 提取标签前面的序号
    const getNumberPrefix = label => {
      // 匹配形如 1, 1.1, 1.1.2 的序号
      const match = label.match(/^([\d.]+)\s/);
      if (match) {
        return match[1]; // 返回完整的序号字符串，如 "1.10"
      }
      return null; // 没有序号
    };

    const aPrefix = getNumberPrefix(a.label);
    const bPrefix = getNumberPrefix(b.label);

    // 如果两个标签都有序号，按序号比较
    if (aPrefix && bPrefix) {
      // 将序号分解为数组，然后按数值比较
      const aParts = aPrefix.split('.').map(num => parseInt(num, 10));
      const bParts = bPrefix.split('.').map(num => parseInt(num, 10));

      // 比较序号数组
      for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
        if (aParts[i] !== bParts[i]) {
          return aParts[i] - bParts[i]; // 数值比较，确保 1.2 排在 1.10 前面
        }
      }
      // 如果前面的数字都相同，则较短的序号在前
      return aParts.length - bParts.length;
    }
    // 如果只有一个标签有序号，则有序号的在前
    else if (aPrefix) {
      return -1;
    } else if (bPrefix) {
      return 1;
    }
    // 如果都没有序号，则按原来的字母序排序
    else {
      return a.label.localeCompare(b.label, 'zh-CN');
    }
  });
};

/**
 * 获取标签的完整路径
 * @param {Object} tag - 标签对象
 * @param {Array} allTags - 所有标签数组
 * @returns {string} 标签路径，如 "标签1 > 标签2 > 标签3"
 */
export const getTagPath = (tag, allTags) => {
  if (!tag) return '';

  const findPath = (currentTag, path = []) => {
    const newPath = [currentTag.label, ...path];

    if (!currentTag.parentId) return newPath;

    const parentTag = allTags.find(t => t.id === currentTag.parentId);
    if (!parentTag) return newPath;

    return findPath(parentTag, newPath);
  };

  return findPath(tag).join(' > ');
};
