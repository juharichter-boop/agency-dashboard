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

    // Employee metrics
    const userMetrics = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        harvestEntries: {
          where: { date: { gte: dateFrom } },
          select: { hours: true, billable: true, amount: true },
        },
      },
    });

    type UserMetric = typeof userMetrics[0];
    type HarvestEntry = UserMetric['harvestEntries'][0];

    const employeeAnalytics = userMetrics
      .filter((u: UserMetric) => u.harvestEntries.length > 0)
      .map((user: UserMetric) => {
        const billableEntries = user.harvestEntries.filter((e: HarvestEntry) => e.billable);
        const nonBillableEntries = user.harvestEntries.filter((e: HarvestEntry) => !e.billable);

        const billableHours = billableEntries.reduce((sum, e: HarvestEntry) => sum + Number(e.hours), 0);
        const nonBillableHours = nonBillableEntries.reduce((sum, e: HarvestEntry) => sum + Number(e.hours), 0);
        const totalHours = billableHours + nonBillableHours;
        const billableAmount = billableEntries.reduce((sum, e: HarvestEntry) => sum + Number(e.amount), 0);

        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          billableHours: Math.round(billableHours * 100) / 100,
          nonBillableHours: Math.round(nonBillableHours * 100) / 100,
          totalHours: Math.round(totalHours * 100) / 100,
          billableRatio: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0,
          billableAmount: Math.round(billableAmount * 100) / 100,
          avgTrackedHours: totalHours > 0 ? Math.round((totalHours / daysBack) * 100) / 100 : 0,
        };
      });

    employeeAnalytics.sort((a: typeof employeeAnalytics[0], b: typeof employeeAnalytics[0]) => b.billableHours - a.billableHours);

    // Project metrics
    const projectMetrics = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        budget: true,
        harvestEntries: {
          where: { date: { gte: dateFrom } },
          select: { hours: true, billable: true, amount: true },
        },
        client: { select: { id: true, name: true } },
      },
    });

    type ProjectMetric = typeof projectMetrics[0];
    type ProjectHarvestEntry = ProjectMetric['harvestEntries'][0];

    const projectAnalytics = projectMetrics
      .filter((p: ProjectMetric) => p.harvestEntries.length > 0)
      .map((project: ProjectMetric) => {
        const billableHours = project.harvestEntries
          .filter((e: ProjectHarvestEntry) => e.billable)
          .reduce((sum, e: ProjectHarvestEntry) => sum + Number(e.hours), 0);
        const revenue = project.harvestEntries
          .filter((e: ProjectHarvestEntry) => e.billable)
          .reduce((sum, e: ProjectHarvestEntry) => sum + Number(e.amount), 0);
        const budget = Number(project.budget);
        const spent = revenue;

        return {
          projectId: project.id,
          name: project.name,
          clientName: project.client?.name || 'No Client',
          budget,
          spent,
          margin: budget > 0 ? budget - spent : 0,
          marginPercent: budget > 0 ? Math.round(((budget - spent) / budget) * 100) : 0,
          billableHours: Math.round(billableHours * 100) / 100,
          revenue: Math.round(revenue * 100) / 100,
        };
      });

    // Team totals
    const allEntries = await prisma.harvestEntry.findMany({
      where: { date: { gte: dateFrom } },
    });

    type AllEntry = typeof allEntries[0];

    const billableHours = allEntries
      .filter((e: AllEntry) => e.billable)
      .reduce((sum, e: AllEntry) => sum + Number(e.hours), 0);
    const nonBillableHours = allEntries
      .filter((e: AllEntry) => !e.billable)
      .reduce((sum, e: AllEntry) => sum + Number(e.hours), 0);
    const totalRevenue = allEntries
      .filter((e: AllEntry) => e.billable)
      .reduce((sum, e: AllEntry) => sum + Number(e.amount), 0);
    const totalHours = billableHours + nonBillableHours;

    return NextResponse.json({
      employees: employeeAnalytics,
      projects: projectAnalytics,
      summary: {
        totalBillableHours: Math.round(billableHours * 100) / 100,
        totalNonBillableHours: Math.round(nonBillableHours * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        utilizationRate: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0,
        avgTrackedHours:
          totalHours > 0
            ? Math.round((totalHours / daysBack) * 100) / 100
            : 0,
        period: {
          from: dateFrom,
          to: new Date(),
          days: daysBack,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching Harvest metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Harvest metrics' },
      { status: 500 }
    );
  }
}
