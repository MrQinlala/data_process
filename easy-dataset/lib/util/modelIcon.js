/**
 * 获取模型对应的图标路径
 * @param {string} modelName - 模型名称
 * @returns {string} 图标路径
 */
export function getModelIcon(modelName) {
  if (!modelName) return '/imgs/models/default.svg';

  // 将模型名称转换为小写以便比较
  const lowerModelName = modelName.toLowerCase();

  // 定义已知模型前缀映射
  const modelPrefixes = [
    { prefix: 'doubao', icon: 'doubao.svg' },
    { prefix: 'qwen', icon: 'qwen.svg' },
    { prefix: 'gpt', icon: 'gpt.svg' },
    { prefix: 'gemini', icon: 'gemini.svg' },
    { prefix: 'claude', icon: 'claude.svg' },
    { prefix: 'llama', icon: 'llama.svg' },
    { prefix: 'mistral', icon: 'mistral.svg' },
    { prefix: 'yi', icon: 'yi.svg' },
    { prefix: 'deepseek', icon: 'deepseek.svg' },
    { prefix: 'chatglm', icon: 'chatglm.svg' },
    { prefix: 'wenxin', icon: 'wenxin.svg' },
    { prefix: 'glm', icon: 'glm.svg' },
    { prefix: 'hunyuan', icon: 'hunyuan.svg' }
  ];

  // 查找匹配的模型前缀
  const matchedPrefix = modelPrefixes.find(({ prefix }) => lowerModelName.includes(prefix));

  // 返回对应的图标路径，如果没有匹配则返回默认图标
  return `/imgs/models/${matchedPrefix ? matchedPrefix.icon : 'default.svg'}`;
}
