import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

async function fetchHarvestEntries() {
  const token = process.env.HARVEST_ACCESS_TOKEN;
  const accountId = process.env.HARVEST_ACCOUNT_ID;

  if (!token || !accountId) {
    throw new Error('HARVEST_ACCESS_TOKEN or HARVEST_ACCOUNT_ID not set');
  }

  try {
    // Fetch time entries from last 90 days
    const from = subDays(new Date(), 90);
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

export async function POST() {
  try {
    console.log('Starting Harvest sync...');
    const entries = await fetchHarvestEntries();

    if (entries.length === 0) {
      return NextResponse.json({ message: 'No entries found', synced: 0 });
    }

    // Sync entries to database
    let synced = 0;
    for (const entry of entries) {
      try {
        await prisma.harvestEntry.upsert({
          where: { externalId: String(entry.id) },
          update: {
            hours: entry.hours,
            amount: entry.billable ? entry.billable_amount || 0 : 0,
            billable: entry.billable || false,
            date: new Date(entry.spent_date),
            employeeName: entry.user?.name || 'Unknown',
            projectName: entry.project?.name || 'Unknown',
          },
          create: {
            externalId: String(entry.id),
            hours: entry.hours,
            amount: entry.billable ? entry.billable_amount || 0 : 0,
            billable: entry.billable || false,
            date: new Date(entry.spent_date),
            employeeName: entry.user?.name || 'Unknown',
            projectName: entry.project?.name || 'Unknown',
          },
        });
        synced++;
      } catch (err) {
        console.error(`Error syncing entry ${entry.id}:`, err);
      }
    }

    console.log(`Harvest sync complete: ${synced} entries synced`);
    return NextResponse.json({ message: 'Harvest sync complete', synced });
  } catch (error) {
    console.error('Harvest sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Harvest data' },
      { status: 500 }
    );
  }
}
