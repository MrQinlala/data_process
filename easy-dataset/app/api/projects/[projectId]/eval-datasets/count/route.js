import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildEvalQuestionWhere } from '@/lib/db/evalDatasets';

export async function GET(request, { params }) {
  try {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);

    const questionType = searchParams.get('questionType') || '';
    const keyword = searchParams.get('keyword') || '';
    const chunkId = searchParams.get('chunkId') || '';

    const questionTypes = searchParams.getAll('questionTypes') || [];

    const tags =
      searchParams.getAll('tags').length > 0
        ? searchParams.getAll('tags')
        : searchParams.get('tag')
          ? searchParams.get('tag').split(',')
          : [];

    const where = buildEvalQuestionWhere(projectId, {
      questionType: questionType || undefined,
      questionTypes: questionTypes.length > 0 ? questionTypes : undefined,
      keyword: keyword || undefined,
      chunkId: chunkId || undefined,
      tags: tags.length > 0 ? tags : undefined
    });

    const [total, byTypeRaw] = await Promise.all([
      db.evalDatasets.count({ where }),
      db.evalDatasets.groupBy({
        by: ['questionType'],
        where,
        _count: { id: true }
      })
    ]);

    const byType = {};
    byTypeRaw.forEach(item => {
      byType[item.questionType] = item._count.id;
    });

    const hasShortAnswer = (byType.short_answer || 0) > 0;
    const hasOpenEnded = (byType.open_ended || 0) > 0;
    const hasSubjective = hasShortAnswer || hasOpenEnded;

    return NextResponse.json(
      {
        code: 0,
        data: { total, byType, hasSubjective, hasShortAnswer, hasOpenEnded }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to count eval datasets:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to count eval datasets', message: error.message },
      { status: 500 }
    );
  }
}
