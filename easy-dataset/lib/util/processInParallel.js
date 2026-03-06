/**
 * 并行处理数组的辅助函数，限制并发数
 * @param {Array} items - 要处理的项目数组
 * @param {Function} processFunction - 处理单个项目的函数
 * @param {number} concurrencyLimit - 并发限制数量
 * @returns {Promise<Array>} 处理结果数组
 */
export async function processInParallel(items, processFunction, concurrencyLimit = 2) {
  const results = [];
  const inProgress = new Set();
  const queue = [...items];

  while (queue.length > 0 || inProgress.size > 0) {
    // 如果有空闲槽位且队列中还有任务，启动新任务
    while (inProgress.size < concurrencyLimit && queue.length > 0) {
      const item = queue.shift();
      const promise = processFunction(item).then(result => {
        inProgress.delete(promise);
        return result;
      });
      inProgress.add(promise);
      results.push(promise);
    }

    // 等待其中一个任务完成
    if (inProgress.size > 0) {
      await Promise.race(inProgress);
    }
  }

  return Promise.all(results);
}

export default processInParallel;
