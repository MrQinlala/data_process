import { NextResponse } from 'next/server';
import { getUploadFileInfoById } from '@/lib/db/upload-files';
import { createGaPairs, getGaPairsByFileId } from '@/lib/db/ga-pairs';

/**
 * 批量手动添加 GA 对到多个文件
 */
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const body = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const { fileIds, gaPair, appendMode = false } = body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: 'File IDs array is required' }, { status: 400 });
    }

    if (!gaPair || !gaPair.genreTitle || !gaPair.audienceTitle) {
      return NextResponse.json({ error: 'GA pair with genreTitle and audienceTitle is required' }, { status: 400 });
    }

    console.log('开始处理批量手动添加GA对请求');
    console.log('项目ID:', projectId);
    console.log('请求的文件IDs:', fileIds);
    console.log('GA对:', gaPair);

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

    // 批量手动添加 GA 对
    console.log('开始批量手动添加GA对...');
    console.log('追加模式:', appendMode);
    const results = [];

    for (const file of validFiles) {
      try {
        console.log(`处理文件: ${file.fileName}`);

        // 检查是否已存在 GA 对
        const existingPairs = await getGaPairsByFileId(file.id);

        let pairNumber = 1;
        if (appendMode && existingPairs && existingPairs.length > 0) {
          // 追加模式：在现有 GA 对后面添加
          pairNumber = existingPairs.length + 1;
        } else if (!appendMode && existingPairs && existingPairs.length > 0) {
          // 非追加模式：如果已存在 GA 对则跳过
          console.log(`文件 ${file.fileName} 已存在GA对，跳过`);
          results.push({
            fileId: file.id,
            fileName: file.fileName,
            success: true,
            skipped: true,
            message: 'GA pairs already exist'
          });
          continue;
        }

        // 创建 GA 对数据
        const gaPairData = [
          {
            projectId,
            fileId: file.id,
            pairNumber,
            genreTitle: gaPair.genreTitle.trim(),
            genreDesc: gaPair.genreDesc?.trim() || '',
            audienceTitle: gaPair.audienceTitle.trim(),
            audienceDesc: gaPair.audienceDesc?.trim() || '',
            isActive: true
          }
        ];

        // 保存 GA 对
        if (appendMode) {
          // 追加模式：只创建新的 GA 对
          await createGaPairs(gaPairData);
        } else {
          // 非追加模式：使用 saveGaPairs 替换现有的
          const { saveGaPairs } = await import('@/lib/db/ga-pairs');
          await saveGaPairs(projectId, file.id, [
            {
              genre: { title: gaPair.genreTitle.trim(), description: gaPair.genreDesc?.trim() || '' },
              audience: { title: gaPair.audienceTitle.trim(), description: gaPair.audienceDesc?.trim() || '' }
            }
          ]);
        }

        results.push({
          fileId: file.id,
          fileName: file.fileName,
          success: true,
          skipped: false,
          message: 'GA pair added successfully'
        });

        console.log(`成功为文件 ${file.fileName} 添加GA对`);
      } catch (error) {
        console.error(`为文件 ${file.fileName} 添加GA对失败:`, error);
        results.push({
          fileId: file.id,
          fileName: file.fileName,
          success: false,
          skipped: false,
          error: error.message,
          message: `Failed: ${error.message}`
        });
      }
    }

    // 统计结果
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`批量手动添加完成: 成功${successCount}个, 失败${failureCount}个`);

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
      message: `Added GA pairs to ${successCount} files, ${failureCount} failed, ${invalidFileIds.length} files not found`
    });
  } catch (error) {
    console.error('Error batch adding manual GA pairs:', String(error));
    return NextResponse.json({ error: String(error) || 'Failed to batch add manual GA pairs' }, { status: 500 });
  }
}
