import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { subDays } from 'date-fns';

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
    const daysBack = parseInt(searchParams.get('daysBack') || '30');
    const dateFrom = subDays(new Date(), daysBack);

    // Employee task metrics
    const userMetrics = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        asanaTasks: {
          select: {
            status: true,
            dueDate: true,
            completedAt: true,
          },
        },
      },
    });

    const employeeAnalytics = userMetrics
      .filter((u: typeof userMetrics[0]) => u.asanaTasks.length > 0)
      .map((user: typeof userMetrics[0]) => {
        const completed = user.asanaTasks.filter((t) => t.status === 'COMPLETED');
        const open = user.asanaTasks.filter((t) => t.status === 'OPEN');
        const overdue = open.filter(
          (t) => t.dueDate && new Date(t.dueDate) < new Date()
        );

        const totalTasks = user.asanaTasks.length;

        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          completedTasks: completed.length,
          openTasks: open.length,
          overdueTasks: overdue.length,
          totalTasks,
          completionRate: totalTasks > 0 ? Math.round((completed.length / totalTasks) * 100) : 0,
        };
      });

    employeeAnalytics.sort((a, b) => b.completedTasks - a.completedTasks);

    // Project task metrics
    const projectMetrics = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        asanaTasks: {
          select: {
            status: true,
            dueDate: true,
            completedAt: true,
          },
        },
        client: { select: { name: true } },
      },
    });

    const projectAnalytics = projectMetrics
      .filter((p) => p.asanaTasks.length > 0)
      .map((project) => {
        const completed = project.asanaTasks.filter(
          (t) => t.status === 'COMPLETED'
        );
        const open = project.asanaTasks.filter((t) => t.status === 'OPEN');
        const overdue = open.filter(
          (t) => t.dueDate && new Date(t.dueDate) < new Date()
        );

        const totalTasks = project.asanaTasks.length;

        return {
          projectId: project.id,
          name: project.name,
          clientName: project.client?.name || 'No Client',
          completedTasks: completed.length,
          openTasks: open.length,
          overdueTasks: overdue.length,
          totalTasks,
          progressRate: totalTasks > 0 ? Math.round((completed.length / totalTasks) * 100) : 0,
        };
      });

    // Team totals
    const allTasks = await prisma.asanaTask.findMany();
    const completed = allTasks.filter((t) => t.status === 'COMPLETED');
    const open = allTasks.filter((t) => t.status === 'OPEN');
    const overdue = open.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date()
    );

    return NextResponse.json({
      employees: employeeAnalytics,
      projects: projectAnalytics,
      summary: {
        totalCompletedTasks: completed.length,
        totalOpenTasks: open.length,
        totalOverdueTasks: overdue.length,
        totalTasks: allTasks.length,
        completionRate:
          allTasks.length > 0
            ? Math.round((completed.length / allTasks.length) * 100)
            : 0,
        period: {
          from: dateFrom,
          to: new Date(),
          days: daysBack,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching Asana metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Asana metrics' },
      { status: 500 }
    );
  }
}
