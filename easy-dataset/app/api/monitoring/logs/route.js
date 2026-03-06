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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchTerm = searchParams.get('search') || '';

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

    if (searchTerm) {
      where.OR = [{ model: { contains: searchTerm } }, { errorMessage: { contains: searchTerm } }];
    }

    const total = await db.llmUsageLogs.count({ where });
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
        createAt: true
      },
      orderBy: {
        createAt: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    const projectIds = [...new Set(logs.map(log => log.projectId))];
    const projects = await db.projects.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, name: true }
    });
    const projectMap = projects.reduce((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {});

    const details = logs.map(log => ({
      id: log.id,
      projectId: log.projectId,
      projectName: projectMap[log.projectId] || 'Unknown Project',
      provider: log.provider,
      model: log.model,
      status: log.status,
      failureReason: log.errorMessage,
      inputTokens: log.inputTokens,
      outputTokens: log.outputTokens,
      totalTokens: log.totalTokens,
      calls: 1, // Single record
      avgLatency: log.status === 'SUCCESS' ? (log.latency / 1000).toFixed(2) + 's' : '-',
      createAt: log.createAt
    }));

    return NextResponse.json({
      details,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('Failed to fetch monitoring logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
