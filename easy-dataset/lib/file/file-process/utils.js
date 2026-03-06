/**
 * 名字太长影响 UI 显示，截取文件名
 * @param {*} filename
 */
export function handleLongFileName(filename) {
  if (filename.length <= 13) {
    return filename;
  }
  const front = filename.substring(0, 7);
  const back = filename.substring(filename.length - 5);
  return `${front}···${back}`;
}
