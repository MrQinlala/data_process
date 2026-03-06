import { NextResponse } from 'next/server';
import { batchGenerateGaPairs } from '@/lib/services/ga/ga-pairs';
import { getUploadFileInfoById } from '@/lib/db/upload-files'; // 导入单个文件查询函数

/**
 * 批量生成多个文件的 GA 对
 */
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const body = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const { fileIds, modelConfigId, language = '中文', appendMode = false } = body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: 'File IDs array is required' }, { status: 400 });
    }

    if (!modelConfigId) {
      return NextResponse.json({ error: 'Model configuration ID is required' }, { status: 400 });
    }

    console.log('开始处理批量生成GA对请求');
    console.log('项目ID:', projectId);
    console.log('请求的文件IDs:', fileIds);

    // 使用 getUploadFileInfoById 逐个验证文件
    const validFiles = [];
    const invalidFileIds = [];

    for (const fileId of fileIds) {
      try {
        console.log(`正在验证文件: ${fileId}`);
        const fileInfo = await getUploadFileInfoById(fileId);

        if (fileInfo && fileInfo.projectId === projectId) {
          console.log(`文件验证成功: ${fileInfo.fileName}`);
          validFiles.push(fileInfo);
        } else if (fileInfo) {
          console.log(`文件属于其他项目: ${fileInfo.projectId} != ${projectId}`);
          invalidFileIds.push(fileId);
        } else {
          console.log(`文件不存在: ${fileId}`);
          invalidFileIds.push(fileId);
        }
      } catch (error) {
        console.error(`验证文件 ${fileId} 时出错:`, String(error));
        invalidFileIds.push(fileId);
      }
    }

    console.log(`文件验证完成: 有效${validFiles.length}个, 无效${invalidFileIds.length}个`);

    if (validFiles.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid files found',
          debug: {
            projectId,
            requestedIds: fileIds,
            invalidIds: invalidFileIds,
            message: 'None of the requested files belong to this project or exist in the database'
          }
        },
        { status: 404 }
      );
    }

    // 批量生成 GA 对
    console.log('开始批量生成GA对...');
    console.log('追加模式:', appendMode);
    const results = await batchGenerateGaPairs(
      projectId,
      validFiles,
      modelConfigId,
      language,
      appendMode // 传递追加模式参数
    );

    // 统计结果
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`批量生成完成: 成功${successCount}个, 失败${failureCount}个`);

    return NextResponse.json({
      success: true,
      data: results,
      summary: {
        total: results.length,
        success: successCount,
        failure: failureCount,
        processed: validFiles.length,
        skipped: invalidFileIds.length
      },
      message: `Generated GA pairs for ${successCount} files, ${failureCount} failed, ${invalidFileIds.length} files not found`
    });
  } catch (error) {
    console.error('Error batch generating GA pairs:', String(error));
    return NextResponse.json({ error: String(error) || 'Failed to batch generate GA pairs' }, { status: 500 });
  }
}
