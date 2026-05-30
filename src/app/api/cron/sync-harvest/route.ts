import { NextRequest, NextResponse } from 'next/server';
import { syncHarvestData } from '@/lib/sync/harvest';

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('Starting Harvest data sync...');
    await syncHarvestData(30); // Sync last 30 days
    console.log('Harvest data sync completed');

    return NextResponse.json({
      success: true,
      message: 'Harvest data synced successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error syncing Harvest data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
