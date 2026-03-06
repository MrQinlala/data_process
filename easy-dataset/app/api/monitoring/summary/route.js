import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
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

    const logs = await db.llmUsageLogs.findMany({
      where,
      select: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        latency: true,
        status: true,
        createAt: true,
        dateString: true,
        model: true
      }
    });

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

    logs.forEach(log => {
      summary.totalTokens += log.totalTokens;
      summary.inputTokens += log.inputTokens;
      summary.outputTokens += log.outputTokens;

      if (log.status === 'SUCCESS') {
        summary.successCalls++;
        summary.totalLatency += log.latency;
      } else {
        summary.failedCalls++;
      }

      let timeKey;
      if (timeRange === '24h') {
        const date = new Date(log.createAt);
        timeKey = `${String(date.getHours()).padStart(2, '0')}:00`;
      } else {
        timeKey = log.dateString.slice(5);
      }

      if (!trendMap[timeKey]) {
        trendMap[timeKey] = { name: timeKey, input: 0, output: 0 };
      }
      trendMap[timeKey].input += log.inputTokens;
      trendMap[timeKey].output += log.outputTokens;

      const modelKey = log.model;
      if (!modelStats[modelKey]) {
        modelStats[modelKey] = { name: modelKey, value: 0 };
      }
      modelStats[modelKey].value += log.totalTokens;
    });

    if (summary.successCalls > 0) {
      summary.avgLatency = Math.round(summary.totalLatency / summary.successCalls);
    }
    summary.avgTokensPerCall = summary.totalCalls > 0 ? Math.round(summary.totalTokens / summary.totalCalls) : 0;
    summary.failureRate = summary.totalCalls > 0 ? summary.failedCalls / summary.totalCalls : 0;

    const trend = Object.values(trendMap).sort((a, b) => a.name.localeCompare(b.name));
    const modelDistribution = Object.values(modelStats).sort((a, b) => b.value - a.value);

    const projects = await db.projects.findMany({
      select: { id: true, name: true },
      orderBy: { createAt: 'desc' }
    });

    const allLogs = await db.llmUsageLogs.findMany({
      select: { provider: true },
      distinct: ['provider']
    });
    const providers = allLogs.map(log => log.provider).filter(Boolean);

    return NextResponse.json({
      summary,
      trend,
      modelDistribution,
      projects,
      providers
    });
  } catch (error) {
    console.error('Failed to fetch monitoring summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
