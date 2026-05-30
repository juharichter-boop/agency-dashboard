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
    const entries = data.time_entries || [];
    console.log(`Fetched ${entries.length} time entries from Harvest`);
    if (entries.length > 0) {
      console.log('Sample entry:', JSON.stringify(entries[0], null, 2));
    }
    return entries;
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

    const billableEntries = entries.filter((e: any) => e.billable);
    console.log(`Found ${billableEntries.length} billable entries`);

    const billableHours = billableEntries.reduce((sum: number, e: any) => sum + e.hours, 0);

    const totalRevenue = billableEntries.reduce((sum: number, e: any) => {
      // Calculate revenue from billable_rate (set by task/project) or user's hourly_rate
      const rate = e.billable_rate || e.user_assignment?.hourly_rate || 0;
      const hours = e.hours || 0;
      const entryRevenue = rate * hours;
      return sum + entryRevenue;
    }, 0);

    // Get currency from first entry's client
    let currency = 'USD';
    if (entries.length > 0 && entries[0].client?.currency) {
      currency = entries[0].client.currency;
    }

    console.log(`Calculated: billableHours=${billableHours}, totalRevenue=${totalRevenue}, currency=${currency}`);

    return NextResponse.json({
      message: 'Harvest sync complete',
      synced: entries.length,
      totalHours: entries.reduce((sum: number, e: any) => sum + e.hours, 0),
      billableHours,
      totalRevenue,
      currency,
    });
  } catch (error) {
    console.error('Harvest sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Harvest data' },
      { status: 500 }
    );
  }
}
