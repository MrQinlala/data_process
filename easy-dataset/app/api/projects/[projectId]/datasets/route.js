import { NextResponse } from 'next/server';
import {
  deleteDataset,
  getDatasetsByPagination,
  getDatasetsIds,
  getDatasetsById,
  updateDataset
} from '@/lib/db/datasets';
import datasetService from '@/lib/services/datasets';

// 优化思维链函数已移至服务层

/**
 * 生成数据集（为单个问题生成答案）
 */
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const { questionId, model, language } = await request.json();

    // 使用数据集生成服务
    const result = await datasetService.generateDatasetForQuestion(projectId, questionId, {
      model,
      language
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to generate dataset:', String(error));
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate dataset'
      },
      { status: 500 }
    );
  }
}

/**
 * 获取项目的所有数据集
 */
export async function GET(request, { params }) {
  try {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);
    // 验证项目ID
    if (!projectId) {
      return NextResponse.json({ error: '项目ID不能为空' }, { status: 400 });
    }
    const page = parseInt(searchParams.get('page')) || 1;
    const size = parseInt(searchParams.get('size')) || 10;
    const input = searchParams.get('input');
    const field = searchParams.get('field') || 'question';
    const status = searchParams.get('status');
    const hasCot = searchParams.get('hasCot');
    const isDistill = searchParams.get('isDistill');
    const scoreRange = searchParams.get('scoreRange');
    const customTag = searchParams.get('customTag');
    const noteKeyword = searchParams.get('noteKeyword');
    const chunkName = searchParams.get('chunkName');
    let confirmed = undefined;
    if (status === 'confirmed') confirmed = true;
    if (status === 'unconfirmed') confirmed = false;

    let selectedAll = searchParams.get('selectedAll');

    if (selectedAll) {
      let data = await getDatasetsIds(
        projectId,
        confirmed,
        input,
        field,
        hasCot,
        isDistill,
        scoreRange,
        customTag,
        noteKeyword,
        chunkName
      );
      return NextResponse.json(data);
    }

    // 获取数据集
    const datasets = await getDatasetsByPagination(
      projectId,
      page,
      size,
      confirmed,
      input,
      field, // 传递搜索字段参数
      hasCot, // 传递思维链筛选参数
      isDistill, // 传递蒸馏数据集筛选参数
      scoreRange, // 传递评分范围筛选参数
      customTag, // 传递自定义标签筛选参数
      noteKeyword, // 传递备注关键字筛选参数
      chunkName // 传递文本块名称筛选参数
    );

    return NextResponse.json(datasets);
  } catch (error) {
    console.error('获取数据集失败:', String(error));
    return NextResponse.json(
      {
        error: error.message || '获取数据集失败'
      },
      { status: 500 }
    );
  }
}

/**
 * 删除数据集
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const datasetId = searchParams.get('id');
    if (!datasetId) {
      return NextResponse.json(
        {
          error: 'Dataset ID cannot be empty'
        },
        { status: 400 }
      );
    }

    await deleteDataset(datasetId);

    return NextResponse.json({
      success: true,
      message: 'Dataset deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete dataset:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to delete dataset'
      },
      { status: 500 }
    );
  }
}

/**
 * 编辑数据集
 */
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const datasetId = searchParams.get('id');
    const { answer, cot, question, confirmed } = await request.json();
    if (!datasetId) {
      return NextResponse.json(
        {
          error: 'Dataset ID cannot be empty'
        },
        { status: 400 }
      );
    }
    // 获取所有数据集
    let dataset = await getDatasetsById(datasetId);
    if (!dataset) {
      return NextResponse.json(
        {
          error: 'Dataset does not exist'
        },
        { status: 404 }
      );
    }
    let data = { id: datasetId };
    if (confirmed !== undefined) data.confirmed = confirmed;
    if (answer) data.answer = answer;
    if (cot) data.cot = cot;
    if (question) data.question = question;

    // 保存更新后的数据集列表
    await updateDataset(data);

    return NextResponse.json({
      success: true,
      message: 'Dataset updated successfully',
      dataset: dataset
    });
  } catch (error) {
    console.error('Failed to update dataset:', String(error));
    return NextResponse.json(
      {
        error: error.message || 'Failed to update dataset'
      },
      { status: 500 }
    );
  }
}
