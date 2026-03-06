import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildEvalQuestionWhere } from '@/lib/db/evalDatasets';

const SMALL_TOTAL_THRESHOLD = 5000;
const HARD_LIMIT = 50000;

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const body = await request.json();

    const {
      questionType = '',
      questionTypes = [],
      keyword = '',
      chunkId = '',
      tags = [],
      limit = 0,
      strategy = 'random'
    } = body || {};

    const where = buildEvalQuestionWhere(projectId, {
      questionType: questionType || undefined,
      questionTypes: Array.isArray(questionTypes) && questionTypes.length > 0 ? questionTypes : undefined,
      keyword: keyword || undefined,
      chunkId: chunkId || undefined,
      tags: Array.isArray(tags) && tags.length > 0 ? tags : undefined
    });

    const total = await db.evalDatasets.count({ where });

    if (total === 0) {
      return NextResponse.json(
        {
          code: 0,
          data: {
            total: 0,
            selectedCount: 0,
            ids: [],
            strategyUsed: strategy
          }
        },
        { status: 200 }
      );
    }

    let normalizedLimit = typeof limit === 'number' && limit > 0 ? Math.min(limit, HARD_LIMIT) : HARD_LIMIT;

    if (normalizedLimit >= total) {
      const items = await db.evalDatasets.findMany({
        where,
        select: { id: true },
        orderBy: { createAt: 'desc' }
      });

      const ids = items.map(item => item.id);

      return NextResponse.json(
        {
          code: 0,
          data: {
            total,
            selectedCount: ids.length,
            ids,
            strategyUsed: total > HARD_LIMIT ? 'top' : strategy
          }
        },
        { status: 200 }
      );
    }

    let ids = [];
    let strategyUsed = strategy;

    if (total <= SMALL_TOTAL_THRESHOLD) {
      const items = await db.evalDatasets.findMany({
        where,
        select: { id: true },
        orderBy: { createAt: 'desc' }
      });
      const shuffled = shuffleArray(items);
      ids = shuffled.slice(0, normalizedLimit).map(item => item.id);
      strategyUsed = 'random-small';
    } else {
      const items = await db.evalDatasets.findMany({
        where,
        select: { id: true },
        orderBy: { createAt: 'desc' },
        take: normalizedLimit
      });
      ids = items.map(item => item.id);
      strategyUsed = 'top-latest';
    }

    return NextResponse.json(
      {
        code: 0,
        data: {
          total,
          selectedCount: ids.length,
          ids,
          strategyUsed
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to sample eval datasets:', error);
    return NextResponse.json(
      { code: 500, error: 'Failed to sample eval datasets', message: error.message },
      { status: 500 }
    );
  }
}
