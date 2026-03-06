import { NextResponse } from 'next/server';
import { getUploadFileInfoById, delUploadFileInfoById } from '@/lib/db/upload-files';
import { getProject } from '@/lib/db/projects';
import { getProjectChunks, getProjectTocByName } from '@/lib/file/text-splitter';
import { batchSaveTags } from '@/lib/db/tags';
import { handleDomainTree } from '@/lib/util/domain-tree';
import path from 'path';
import { getProjectRoot } from '@/lib/db/base';
import { promises as fs } from 'fs';

/**
 * 批量删除文件
 * 复用单个文件删除的完整逻辑，包括领域树修订
 */
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const body = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const { fileIds, domainTreeAction = 'keep', model, language = '中文' } = body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: 'File IDs array is required' }, { status: 400 });
    }

    console.log('开始处理批量删除文件请求');
    console.log('项目ID:', projectId);
    console.log('请求的文件IDs:', fileIds);
    console.log('领域树操作:', domainTreeAction);

    // 获取项目信息
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: 'The project does not exist' }, { status: 404 });
    }

    // 验证文件并删除
    const results = [];
    const deletedTocs = [];
    let deletedCount = 0;
    let failedCount = 0;
    let totalStats = {
      deletedChunks: 0,
      deletedQuestions: 0,
      deletedDatasets: 0
    };

    for (const fileId of fileIds) {
      try {
        console.log(`正在验证文件: ${fileId}`);
        const fileInfo = await getUploadFileInfoById(fileId);

        if (!fileInfo) {
          console.log(`文件不存在: ${fileId}`);
          results.push({
            fileId,
            success: false,
            error: 'File not found'
          });
          failedCount++;
          continue;
        }

        if (fileInfo.projectId !== projectId) {
          console.log(`文件属于其他项目: ${fileInfo.projectId} != ${projectId}`);
          results.push({
            fileId,
            success: false,
            error: 'File belongs to another project'
          });
          failedCount++;
          continue;
        }

        // 删除文件及其相关的文本块、问题和数据集
        console.log(`删除文件: ${fileInfo.fileName}`);
        const { stats, fileName } = await delUploadFileInfoById(fileId);

        // 累计统计信息
        totalStats.deletedChunks += stats.deletedChunks || 0;
        totalStats.deletedQuestions += stats.deletedQuestions || 0;
        totalStats.deletedDatasets += stats.deletedDatasets || 0;

        // 获取并保存删除的 TOC 信息
        const deleteToc = await getProjectTocByName(projectId, fileName);
        if (deleteToc) {
          deletedTocs.push(deleteToc);
        }

        // 删除 TOC 文件
        try {
          const projectRoot = await getProjectRoot();
          const projectPath = path.join(projectRoot, projectId);
          const tocDir = path.join(projectPath, 'toc');
          const baseName = path.basename(fileInfo.fileName, path.extname(fileInfo.fileName));
          const tocPath = path.join(tocDir, `${baseName}-toc.json`);
          await fs.unlink(tocPath);
          console.log(`成功删除 TOC 文件: ${tocPath}`);
        } catch (error) {
          console.error(`删除 TOC 文件失败:`, String(error));
        }

        results.push({
          fileId,
          fileName: fileInfo.fileName,
          success: true,
          stats
        });
        deletedCount++;

        console.log(`成功删除文件: ${fileInfo.fileName}`);
      } catch (error) {
        console.error(`删除文件 ${fileId} 时出错:`, error);
        results.push({
          fileId,
          success: false,
          error: error.message
        });
        failedCount++;
      }
    }

    console.log(`批量删除完成: 成功${deletedCount}个, 失败${failedCount}个`);

    // 如果选择了保持领域树不变，直接返回删除结果
    if (domainTreeAction === 'keep') {
      return NextResponse.json({
        success: true,
        deletedCount,
        failedCount,
        total: fileIds.length,
        results,
        stats: totalStats,
        domainTreeAction: 'keep',
        message: `Successfully deleted ${deletedCount} files, ${failedCount} failed`
      });
    }

    // 处理领域树更新
    try {
      // 获取项目的所有文件
      const { chunks, toc } = await getProjectChunks(projectId);

      // 如果不存在文本块，说明项目已经没有文件了
      if (!chunks || chunks.length === 0) {
        // 清空领域树
        await batchSaveTags(projectId, []);
        return NextResponse.json({
          success: true,
          deletedCount,
          failedCount,
          total: fileIds.length,
          results,
          stats: totalStats,
          domainTreeAction,
          message: `Successfully deleted ${deletedCount} files, domain tree cleared`,
          domainTreeCleared: true
        });
      }

      // 调用领域树处理模块
      await handleDomainTree({
        projectId,
        action: domainTreeAction,
        allToc: toc,
        model: model,
        language,
        deleteToc: deletedTocs.length > 0 ? deletedTocs : undefined,
        project
      });

      console.log('领域树更新成功');
    } catch (error) {
      console.error('Error updating domain tree after batch deletion:', String(error));
      // 即使领域树更新失败，也不影响文件删除的结果
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      failedCount,
      total: fileIds.length,
      results,
      stats: totalStats,
      domainTreeAction,
      message: `Successfully deleted ${deletedCount} files, ${failedCount} failed`
    });
  } catch (error) {
    console.error('Error batch deleting files:', String(error));
    return NextResponse.json({ error: String(error) || 'Failed to batch delete files' }, { status: 500 });
  }
}
