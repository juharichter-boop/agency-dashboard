import { NextResponse } from 'next/server';
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function fetchHarvestEntries(daysBack: number = 90) {
  const token = process.env.HARVEST_ACCESS_TOKEN;
  const accountId = process.env.HARVEST_ACCOUNT_ID;

  if (!token || !accountId) {
    throw new Error('HARVEST_ACCESS_TOKEN or HARVEST_ACCOUNT_ID not set');
  }

  try {
    const from = subDays(new Date(), daysBack);
    const response = await fetch(
      `https://api.harvestapp.com/v2/time_entries?from=${from.toISOString().split('T')[0]}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Harvest-Account-ID': accountId,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Harvest API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.time_entries || [];
  } catch (error) {
    console.error('Error fetching Harvest entries:', error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    console.log('Starting Harvest sync...');
    const body = await request.json().catch(() => ({}));
    const daysBack = body.daysBack || 90;

    console.log(`Fetching Harvest data for last ${daysBack} days...`);
    const entries = await fetchHarvestEntries(daysBack);

    const billableHours = entries
      .filter((e: any) => e.billable)
      .reduce((sum: number, e: any) => sum + e.hours, 0);

    const totalRevenue = entries
      .filter((e: any) => e.billable)
      .reduce((sum: number, e: any) => sum + (e.billable_amount || 0), 0);

    return NextResponse.json({
      message: 'Harvest sync complete',
      synced: entries.length,
      totalHours: entries.reduce((sum: number, e: any) => sum + e.hours, 0),
      billableHours,
      totalRevenue,
    });
  } catch (error) {
    console.error('Harvest sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Harvest data' },
      { status: 500 }
    );
  }
}
