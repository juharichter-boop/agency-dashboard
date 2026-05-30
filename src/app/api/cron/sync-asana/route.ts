import { NextRequest, NextResponse } from 'next/server';
import { syncAsanaData } from '@/lib/sync/asana';

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
    console.log('Starting Asana data sync...');
    await syncAsanaData();
    console.log('Asana data sync completed');

    return NextResponse.json({
      success: true,
      message: 'Asana data synced successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error syncing Asana data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
