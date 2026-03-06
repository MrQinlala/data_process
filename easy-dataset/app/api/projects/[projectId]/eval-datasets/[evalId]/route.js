import { NextResponse } from 'next/server';
import { getEvalQuestionById, updateEvalQuestion, deleteEvalQuestion } from '@/lib/db/evalDatasets';
import { db } from '@/lib/db/index';

/**
 * Get evaluation dataset details by ID
 * Supports operateType=prev|next to navigate neighbors
 */
export async function GET(request, { params }) {
  try {
    const { projectId, evalId } = params;
    const { searchParams } = new URL(request.url);
    const operateType = searchParams.get('operateType');

    // Navigation request (prev/next)
    if (operateType) {
      const current = await db.evalDatasets.findUnique({
        where: { id: evalId },
        select: { createAt: true }
      });

      if (!current) {
        return NextResponse.json(null);
      }

      let neighbor = null;

      if (operateType === 'prev') {
        // Get previous item (newer createAt when list is sorted desc)
        neighbor = await db.evalDatasets.findFirst({
          where: {
            projectId,
            createAt: { gt: current.createAt }
          },
          orderBy: { createAt: 'asc' },
          select: { id: true }
        });
      } else if (operateType === 'next') {
        // Get next item (older createAt)
        neighbor = await db.evalDatasets.findFirst({
          where: {
            projectId,
            createAt: { lt: current.createAt }
          },
          orderBy: { createAt: 'desc' },
          select: { id: true }
        });
      }

      return NextResponse.json(neighbor || null);
    }

    // Regular detail request
    const evalQuestion = await getEvalQuestionById(evalId);

    if (!evalQuestion) {
      return NextResponse.json({ error: 'Eval question not found' }, { status: 404 });
    }

    return NextResponse.json(evalQuestion);
  } catch (error) {
    console.error('Failed to get eval question:', error);
    return NextResponse.json({ error: error.message || 'Failed to get eval question' }, { status: 500 });
  }
}

/**
 * Update evaluation dataset
 */
export async function PUT(request, { params }) {
  try {
    const { evalId } = params;
    const data = await request.json();

    // Only allow specific fields
    const allowedFields = ['question', 'options', 'correctAnswer', 'tags', 'note'];
    const updateData = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const updated = await updateEvalQuestion(evalId, updateData);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update eval question:', error);
    return NextResponse.json({ error: error.message || 'Failed to update eval question' }, { status: 500 });
  }
}

/**
 * Delete evaluation dataset
 */
export async function DELETE(request, { params }) {
  try {
    const { evalId } = params;

    await deleteEvalQuestion(evalId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete eval question:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete eval question' }, { status: 500 });
  }
}
