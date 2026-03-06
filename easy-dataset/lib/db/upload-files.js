'use server';
import { db } from '@/lib/db/index';
import fs from 'fs';
import path from 'path';
import { deleteDataset } from './datasets';
import { deleteChunkById } from './chunks';

//获取文件列表
export async function getUploadFilesPagination(projectId, page = 1, pageSize = 10, fileName) {
  try {
    const whereClause = {
      projectId,
      fileName: { contains: fileName }
    };
    const [data, total] = await Promise.all([
      db.uploadFiles.findMany({
        where: whereClause,
        orderBy: {
          createAt: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      db.uploadFiles.count({
        where: whereClause
      })
    ]);
    return { data, total };
  } catch (error) {
    console.error('Failed to get uploadFiles by pagination in database');
    throw error;
  }
}

export async function getUploadFileInfoById(fileId) {
  try {
    return await db.uploadFiles.findUnique({ where: { id: fileId } });
  } catch (error) {
    console.error('Failed to get uploadFiles by id in database');
    throw error;
  }
}

export async function getUploadFilesByProjectId(projectId) {
  try {
    return await db.uploadFiles.findMany({
      where: {
        projectId,
        NOT: {
          id: {
            in: await db.chunks
              .findMany({
                where: { projectId },
                select: { fileId: true }
              })
              .then(chunks => chunks.map(chunk => chunk.fileId))
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to get uploadFiles by id in database');
    throw error;
  }
}

export async function checkUploadFileInfoByMD5(projectId, md5) {
  try {
    return await db.uploadFiles.findFirst({
      where: {
        projectId,
        md5
      }
    });
  } catch (error) {
    console.error('Failed to check uploadFiles by md5 in database');
    throw error;
  }
}

export async function createUploadFileInfo(fileInfo) {
  try {
    return await db.uploadFiles.create({ data: fileInfo });
  } catch (error) {
    console.error('Failed to get uploadFiles by id in database');
    throw error;
  }
}

export async function delUploadFileInfoById(fileId) {
  try {
    // 1. 获取文件信息
    let fileInfo = await db.uploadFiles.findUnique({ where: { id: fileId } });
    if (!fileInfo) {
      throw new Error('File not found');
    }

    // 2. 获取与文件关联的所有文本块
    const chunks = await db.chunks.findMany({
      where: { fileId: fileId }
    });

    // 记录统计数据，用于返回给前端显示
    const chunkIds = chunks.map(chunk => chunk.id);
    const stats = {
      chunks: chunks.length,
      questions: 0,
      datasets: 0
    };

    // 3. 找出所有关联的问题和数据集
    let questionIds = [];
    let datasets = [];

    if (chunkIds.length > 0) {
      // 统计问题数量
      const questionsCount = await db.questions.count({
        where: { chunkId: { in: chunkIds } }
      });
      stats.questions = questionsCount;

      // 获取所有问题ID
      const questions = await db.questions.findMany({
        where: { chunkId: { in: chunkIds } },
        select: { id: true }
      });

      questionIds = questions.map(q => q.id);

      // 4. 统计数据集数量
      if (questionIds.length > 0) {
        const datasetsCount = await db.datasets.count({
          where: { questionId: { in: questionIds } }
        });
        stats.datasets = datasetsCount;

        // 获取所有数据集
        datasets = await db.datasets.findMany({
          where: { questionId: { in: questionIds } },
          select: { id: true }
        });
      }
    }

    // 5. 使用事务批量删除所有数据库数据
    // 按照外键依赖关系从外到内删除
    const deleteOperations = [];

    // 先删除数据集
    if (datasets.length > 0) {
      deleteOperations.push(
        db.datasets.deleteMany({
          where: { id: { in: datasets.map(d => d.id) } }
        })
      );
    }

    // 再删除问题
    if (questionIds.length > 0) {
      deleteOperations.push(
        db.questions.deleteMany({
          where: { id: { in: questionIds } }
        })
      );
    }

    // 然后删除文本块
    if (chunkIds.length > 0) {
      deleteOperations.push(
        db.chunks.deleteMany({
          where: { id: { in: chunkIds } }
        })
      );
    }

    // 最后删除文件记录
    deleteOperations.push(
      db.uploadFiles.delete({
        where: { id: fileId }
      })
    );

    // 执行数据库事务，确保原子性
    await db.$transaction(deleteOperations);

    // 6. 删除文件系统中的文件
    let projectPath = path.join(fileInfo.path, fileInfo.fileName);
    if (fileInfo.fileExt !== '.md') {
      let filePath = path.join(fileInfo.path, fileInfo.fileName.replace(/\.[^/.]+$/, '.md'));
      if (fs.existsSync(filePath)) {
        await fs.promises.rm(filePath, { recursive: true });
      }
    }
    if (fs.existsSync(projectPath)) {
      await fs.promises.rm(projectPath, { recursive: true });
    }

    return { success: true, stats, fileName: fileInfo.fileName, fileInfo };
  } catch (error) {
    console.error('Failed to delete uploadFiles by id in database:', error);
    throw error;
  }
}
