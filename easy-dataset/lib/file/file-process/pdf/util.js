import { getProjectRoot } from '@/lib/db/base';
import path from 'path';

export async function getFilePageCount(projectId, fileList) {
  const projectRoot = await getProjectRoot();
  let totalPages = 0;
  for (const file of fileList) {
    if (file.fileName.endsWith('.pdf')) {
      const { getPageNum } = await import('pdf2md-js');
      const filePath = path.join(projectRoot, projectId, 'files', file.fileName);
      try {
        const pageCount = await getPageNum(filePath);
        totalPages += pageCount;
        file.pageCount = pageCount;
      } catch (error) {
        console.error(`Failed to get page count for ${file.fileName}:`, error);
      }
    } else {
      totalPages += 1;
      file.pageCount = 1;
    }
  }
  console.log(`Total pages to process: ${totalPages}`);
  return totalPages;
}
