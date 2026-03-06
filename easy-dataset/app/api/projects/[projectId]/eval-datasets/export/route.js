import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { buildEvalQuestionWhere } from '@/lib/db/evalDatasets';

const BATCH_SIZE = 500;

/**
 * Convert an evaluation item to a CSV row
 */
function convertToCSVRow(item, isHeader = false) {
  if (isHeader) {
    return ['questionType', 'question', 'options', 'correctAnswer', 'tags'].join(',');
  }

  const escapeCSV = str => {
    if (str === null || str === undefined) return '';
    const strValue = String(str);
    if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  };

  return [
    escapeCSV(item.questionType),
    escapeCSV(item.question),
    escapeCSV(item.options),
    escapeCSV(item.correctAnswer),
    escapeCSV(item.tags)
  ].join(',');
}

/**
 * Convert an evaluation item to export format
 */
function formatExportItem(item) {
  return {
    questionType: item.questionType,
    question: item.question,
    options: item.options,
    correctAnswer: item.correctAnswer,
    tags: item.tags
  };
}

/**
 * Export evaluation datasets
 * Supports JSON, JSONL, and CSV
 * Uses batched streaming for large datasets
 */
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const body = await request.json();

    const {
      format = 'json', // json | jsonl | csv
      questionTypes = [],
      tags = [],
      keyword = ''
    } = body;

    // Validate format
    if (!['json', 'jsonl', 'csv'].includes(format)) {
      return NextResponse.json({ code: 400, error: 'Unsupported export format' }, { status: 400 });
    }

    // Build query conditions
    const where = buildEvalQuestionWhere(projectId, {
      questionTypes: questionTypes.length > 0 ? questionTypes : undefined,
      tags: tags.length > 0 ? tags : undefined,
      keyword: keyword || undefined
    });

    // Fetch total count
    const total = await db.evalDatasets.count({ where });

    if (total === 0) {
      return NextResponse.json({ code: 400, error: 'No data matches the criteria' }, { status: 400 });
    }

    // Return directly for small datasets
    if (total <= 1000) {
      const items = await db.evalDatasets.findMany({
        where,
        orderBy: { createAt: 'desc' }
      });

      const formattedItems = items.map(formatExportItem);

      if (format === 'json') {
        return new Response(JSON.stringify(formattedItems, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="eval-datasets-${Date.now()}.json"`
          }
        });
      }

      if (format === 'jsonl') {
        const jsonlContent = formattedItems.map(item => JSON.stringify(item)).join('\n');
        return new Response(jsonlContent, {
          headers: {
            'Content-Type': 'application/x-ndjson',
            'Content-Disposition': `attachment; filename="eval-datasets-${Date.now()}.jsonl"`
          }
        });
      }

      if (format === 'csv') {
        const csvContent = [convertToCSVRow(null, true), ...items.map(item => convertToCSVRow(item))].join('\n');
        return new Response('\uFEFF' + csvContent, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="eval-datasets-${Date.now()}.csv"`
          }
        });
      }
    }

    // Stream export for large datasets
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let isFirst = true;

        // CSV outputs header row first
        if (format === 'csv') {
          controller.enqueue(encoder.encode('\uFEFF' + convertToCSVRow(null, true) + '\n'));
        }

        // JSON outputs opening bracket
        if (format === 'json') {
          controller.enqueue(encoder.encode('[\n'));
        }

        // Fetch data in batches
        const totalBatches = Math.ceil(total / BATCH_SIZE);

        for (let batch = 0; batch < totalBatches; batch++) {
          const items = await db.evalDatasets.findMany({
            where,
            orderBy: { createAt: 'desc' },
            skip: batch * BATCH_SIZE,
            take: BATCH_SIZE
          });

          for (const item of items) {
            const formattedItem = formatExportItem(item);

            if (format === 'json') {
              const prefix = isFirst ? '' : ',\n';
              controller.enqueue(encoder.encode(prefix + JSON.stringify(formattedItem)));
              isFirst = false;
            } else if (format === 'jsonl') {
              controller.enqueue(encoder.encode(JSON.stringify(formattedItem) + '\n'));
            } else if (format === 'csv') {
              controller.enqueue(encoder.encode(convertToCSVRow(item) + '\n'));
            }
          }
        }

        // JSON outputs closing bracket
        if (format === 'json') {
          controller.enqueue(encoder.encode('\n]'));
        }

        controller.close();
      }
    });

    const contentTypes = {
      json: 'application/json',
      jsonl: 'application/x-ndjson',
      csv: 'text/csv; charset=utf-8'
    };

    const extensions = {
      json: 'json',
      jsonl: 'jsonl',
      csv: 'csv'
    };

    return new Response(stream, {
      headers: {
        'Content-Type': contentTypes[format],
        'Content-Disposition': `attachment; filename="eval-datasets-${Date.now()}.${extensions[format]}"`,
        'Transfer-Encoding': 'chunked'
      }
    });
  } catch (error) {
    console.error('Failed to export eval datasets:', error);
    return NextResponse.json({ code: 500, error: error.message || 'Export failed' }, { status: 500 });
  }
}

/**
 * Get export preview (count only)
 */
export async function GET(request, { params }) {
  try {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);

    // Parse query params
    const questionTypes = searchParams.getAll('questionTypes');
    const tags = searchParams.getAll('tags');
    const keyword = searchParams.get('keyword') || '';

    // Build query conditions
    const where = buildEvalQuestionWhere(projectId, {
      questionTypes: questionTypes.length > 0 ? questionTypes : undefined,
      tags: tags.length > 0 ? tags : undefined,
      keyword: keyword || undefined
    });

    // Count rows
    const total = await db.evalDatasets.count({ where });

    return NextResponse.json({
      code: 0,
      data: {
        total,
        isLargeDataset: total > 1000
      }
    });
  } catch (error) {
    console.error('Failed to get export preview:', error);
    return NextResponse.json({ code: 500, error: error.message || 'Failed to get export preview' }, { status: 500 });
  }
}
