import { NextResponse } from 'next/server';
import { getImageDatasetsTagsByProject } from '@/lib/db/imageDatasets';

// 获取项目中所有已使用的标签
export async function GET(request, { params }) {
  try {
    const { projectId } = params;

    // 获取项目的所有数据集
    const datasets = await getImageDatasetsTagsByProject(projectId);

    console.log('datasets', datasets);

    // 提取所有标签
    const tagsSet = new Set();
    datasets.forEach(dataset => {
      if (dataset.tags) {
        try {
          const tags = JSON.parse(dataset.tags);
          if (Array.isArray(tags)) {
            tags.forEach(tag => tagsSet.add(tag));
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    });

    // 转换为数组并排序
    const tags = Array.from(tagsSet).sort();

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Failed to get tags:', error);
    return NextResponse.json({ error: error.message || 'Failed to get tags' }, { status: 500 });
  }
}
