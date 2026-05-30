import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const daysBack = parseInt(searchParams.get('daysBack') || '7');
    const dateFrom = subDays(new Date(), daysBack);

    // Get metrics grouped by user
    const userMetrics = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        slackMetrics: {
          where: { date: { gte: dateFrom } },
          select: { messageCount: true, fileCount: true, date: true },
        },
      },
      where: {
        slackMetrics: { some: { date: { gte: dateFrom } } },
      },
    });

    const analyticsData = userMetrics.map((user) => {
      const totalMessages = user.slackMetrics.reduce(
        (sum, m) => sum + m.messageCount,
        0
      );
      const totalFiles = user.slackMetrics.reduce(
        (sum, m) => sum + m.fileCount,
        0
      );
      const avgMessagesPerDay = daysBack > 0 ? totalMessages / daysBack : 0;

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        totalMessages,
        totalFiles,
        avgMessagesPerDay: Math.round(avgMessagesPerDay * 100) / 100,
        dailyBreakdown: user.slackMetrics,
      };
    });

    // Sort by total messages descending
    analyticsData.sort((a, b) => b.totalMessages - a.totalMessages);

    // Get activity heatmap data (messages by day of week and hour)
    const allMetrics = await prisma.slackMetric.findMany({
      where: { date: { gte: dateFrom } },
    });

    const heatmapData = allMetrics.reduce(
      (acc, metric) => {
        const dayOfWeek = metric.date.toLocaleDateString('en-US', {
          weekday: 'short',
        });
        const key = dayOfWeek;

        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += metric.messageCount;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      userMetrics: analyticsData,
      heatmapData,
      summary: {
        totalMessages: analyticsData.reduce(
          (sum, u) => sum + u.totalMessages,
          0
        ),
        totalFiles: analyticsData.reduce(
          (sum, u) => sum + u.totalFiles,
          0
        ),
        activeUsers: analyticsData.length,
        period: {
          from: dateFrom,
          to: new Date(),
          days: daysBack,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching Slack metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Slack metrics' },
      { status: 500 }
    );
  }
}
