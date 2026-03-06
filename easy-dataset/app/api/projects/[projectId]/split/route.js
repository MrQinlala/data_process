import { NextResponse } from 'next/server';
import { splitProjectFile, getProjectChunks } from '@/lib/file/text-splitter';
import { getProject, updateProject } from '@/lib/db/projects';
import { getTags } from '@/lib/db/tags';
import { handleDomainTree } from '@/lib/util/domain-tree';

// 处理文本分割请求
export async function POST(request, { params }) {
  try {
    const { projectId } = params;

    // 获取请求体
    const { fileNames, model, language, domainTreeAction = 'rebuild' } = await request.json();

    if (!model) {
      return NextResponse.json({ error: 'Please Select Model' }, { status: 400 });
    }

    const project = await getProject(projectId);

    let result = {
      totalChunks: 0,
      chunks: [],
      toc: ''
    };
    for (let i = 0; i < fileNames.length; i++) {
      const fileName = fileNames[i];
      // 分割文本
      const { toc, chunks, totalChunks } = await splitProjectFile(projectId, fileName);
      result.toc += toc;
      result.chunks.push(...chunks);
      result.totalChunks += totalChunks;
      console.log(projectId, fileName, `Text split completed, ${domainTreeAction} domain tree`);
    }

    // 调用领域树处理模块
    const tags = await handleDomainTree({
      projectId,
      action: domainTreeAction,
      newToc: result.toc,
      model,
      language,
      fileNames,
      project
    });

    if (!tags && domainTreeAction !== 'keep') {
      await updateProject(projectId, { ...project });
      return NextResponse.json(
        { error: 'AI analysis failed, please check model configuration, delete file and retry!' },
        { status: 400 }
      );
    }

    return NextResponse.json({ ...result, tags });
  } catch (error) {
    console.error('Text split error:', String(error));
    return NextResponse.json({ error: error.message || 'Text split failed' }, { status: 500 });
  }
}

// 获取项目中的所有文本块
export async function GET(request, { params }) {
  try {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');
    // 验证项目ID
    if (!projectId) {
      return NextResponse.json({ error: 'The project ID cannot be empty' }, { status: 400 });
    }

    // 获取文本块详细信息
    const result = await getProjectChunks(projectId, filter);

    const tags = await getTags(projectId);

    // 返回详细的文本块信息和文件结果（单个文件）
    return NextResponse.json({
      chunks: result.chunks,
      ...result.fileResult, // 单个文件结果，而不是数组
      tags
    });
  } catch (error) {
    console.error('Failed to get text chunks:', String(error));
    return NextResponse.json({ error: error.message || 'Failed to get text chunks' }, { status: 500 });
  }
}
