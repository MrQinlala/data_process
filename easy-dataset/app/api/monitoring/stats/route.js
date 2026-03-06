import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d'; // 24h, 7d, 30d
    const projectId = searchParams.get('projectId');
    const provider = searchParams.get('provider');
    const status = searchParams.get('status');

    let startDate = new Date();

    if (timeRange === '24h') {
      startDate.setHours(startDate.getHours() - 24);
    } else if (timeRange === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setDate(startDate.getDate() - 7);
    }

    const where = {
      createAt: {
        gte: startDate
      }
    };

    if (projectId && projectId !== 'all') {
      where.projectId = projectId;
    }
    if (provider && provider !== 'all') {
      where.provider = provider;
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    // 1. Fetch data for aggregation
    // Note: Prisma aggregation can be slow on very large datasets. If needed, optimize with pre-aggregated tables.
    const logs = await db.llmUsageLogs.findMany({
      where,
      select: {
        id: true,
        projectId: true,
        provider: true,
        model: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        latency: true,
        status: true,
        errorMessage: true,
        createAt: true,
        dateString: true
      },
      orderBy: {
        createAt: 'desc'
      }
    });

    // Build project name map
    const projects = await db.projects.findMany({
      select: { id: true, name: true }
    });
    const projectMap = projects.reduce((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {});

    // 2. Process and aggregate
    const summary = {
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalCalls: logs.length,
      successCalls: 0,
      failedCalls: 0,
      totalLatency: 0,
      avgLatency: 0
    };

    const trendMap = {};
    const modelStats = {};
    const detailedStatsMap = {}; // Key: projectId-model-status-errorMessage

    logs.forEach(log => {
      // Summary
      summary.totalTokens += log.totalTokens;
      summary.inputTokens += log.inputTokens;
      summary.outputTokens += log.outputTokens;

      if (log.status === 'SUCCESS') {
        summary.successCalls++;
        summary.totalLatency += log.latency;
      } else {
        summary.failedCalls++;
      }

      // Trend (by day or hour)
      let timeKey;
      if (timeRange === '24h') {
        const date = new Date(log.createAt);
        timeKey = `${String(date.getHours()).padStart(2, '0')}:00`;
      } else {
        timeKey = log.dateString.slice(5); // MM-DD
      }

      if (!trendMap[timeKey]) {
        trendMap[timeKey] = { name: timeKey, input: 0, output: 0 };
      }
      trendMap[timeKey].input += log.inputTokens;
      trendMap[timeKey].output += log.outputTokens;

      // Model Distribution
      const modelKey = log.model;
      if (!modelStats[modelKey]) {
        modelStats[modelKey] = { name: modelKey, value: 0 };
      }
      modelStats[modelKey].value += log.totalTokens;

      // Detailed Table Aggregation
      // Key: projectId + model + status + (errorMessage || '')
      const errorKey = log.errorMessage || '';
      const detailKey = `${log.projectId}|${log.model}|${log.status}|${errorKey}`;

      if (!detailedStatsMap[detailKey]) {
        detailedStatsMap[detailKey] = {
          projectId: log.projectId,
          projectName: projectMap[log.projectId] || 'Unknown Project',
          provider: log.provider,
          model: log.model,
          status: log.status,
          failureReason: log.errorMessage,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          calls: 0,
          totalLatency: 0
        };
      }
      const detailItem = detailedStatsMap[detailKey];
      detailItem.inputTokens += log.inputTokens;
      detailItem.outputTokens += log.outputTokens;
      detailItem.totalTokens += log.totalTokens;
      detailItem.calls += 1;
      if (log.status === 'SUCCESS') {
        detailItem.totalLatency += log.latency;
      }
    });

    // Calculate averages
    if (summary.successCalls > 0) {
      summary.avgLatency = Math.round(summary.totalLatency / summary.successCalls);
    }
    summary.avgTokensPerCall = summary.totalCalls > 0 ? Math.round(summary.totalTokens / summary.totalCalls) : 0;
    summary.failureRate = summary.totalCalls > 0 ? summary.failedCalls / summary.totalCalls : 0;

    // Format chart data
    const trend = Object.values(trendMap).sort((a, b) => {
      // Simple sorting; for production use, consider stricter time ordering.
      return a.name.localeCompare(b.name);
    });

    const modelDistribution = Object.values(modelStats).sort((a, b) => b.value - a.value);

    // Format detailed table data
    const details = Object.values(detailedStatsMap)
      .map(item => ({
        ...item,
        avgLatency:
          item.status === 'SUCCESS' && item.calls > 0 ? (item.totalLatency / item.calls / 1000).toFixed(2) + 's' : '-'
      }))
      .sort((a, b) => b.totalTokens - a.totalTokens); // Default sorting by token usage

    return NextResponse.json({
      summary,
      trend,
      modelDistribution,
      details,
      projects
    });
  } catch (error) {
    console.error('Failed to fetch monitoring stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
