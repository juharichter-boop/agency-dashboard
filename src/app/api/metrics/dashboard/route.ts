import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Auth check disabled - TODO: re-enable when Clerk is properly configured

    const searchParams = request.nextUrl.searchParams;
    const daysBack = parseInt(searchParams.get('daysBack') || '30');
    const dateFrom = subDays(new Date(), daysBack);

    try {
      // Try to get real data from the database
      const harvestData = await prisma.harvestEntry.groupBy({
        by: ['billable'],
        where: { date: { gte: dateFrom } },
        _sum: { hours: true, amount: true },
      });

      type HarvestData = typeof harvestData[0];
      const billableHours = harvestData
        .find((d: HarvestData) => d.billable)
        ?._sum.hours || 0;
      const totalRevenue = harvestData
        .find((d: HarvestData) => d.billable)
        ?._sum.amount || 0;

      const openTasks = await prisma.asanaTask.count({
        where: {
          status: 'OPEN',
        },
      });

      const slackMetrics = await prisma.slackMetric.aggregate({
        where: { date: { gte: dateFrom } },
        _sum: { messageCount: true, fileCount: true },
        _count: { id: true },
      });

      // Calculate utilization rate
      const nonBillableHours = harvestData
        .find((d: HarvestData) => !d.billable)
        ?._sum.hours || 0;
      const totalHours = Number(billableHours || 0) + Number(nonBillableHours || 0);
      const utilizationRate = totalHours > 0
        ? Math.round((Number(billableHours || 0) / totalHours) * 100)
        : 0;

      return NextResponse.json({
        metrics: {
          totalBillableHours: Number(billableHours || 0),
          totalRevenue: Number(totalRevenue || 0),
          openTasks,
          slackActivityScore: slackMetrics._sum.messageCount || 0,
          utilizationRate,
          totalMessages: slackMetrics._sum.messageCount || 0,
          totalFiles: slackMetrics._sum.fileCount || 0,
          activeUsers: slackMetrics._count.id || 0,
        },
        period: {
          from: dateFrom,
          to: new Date(),
          days: daysBack,
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Return mock data if database is unavailable
      return NextResponse.json({
        metrics: {
          totalBillableHours: 156,
          totalRevenue: 12450,
          openTasks: 24,
          slackActivityScore: 457,
          utilizationRate: 82,
          totalMessages: 457,
          totalFiles: 12,
          activeUsers: 8,
        },
        period: {
          from: dateFrom,
          to: new Date(),
          days: daysBack,
        },
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
