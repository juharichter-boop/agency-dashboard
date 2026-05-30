import { NextRequest, NextResponse } from 'next/server';
import { syncSlackMetrics } from '@/lib/sync/slack';

// Vercel Cron endpoint for syncing Slack metrics
// Configure in vercel.json with: "{ \"path\": \"/api/cron/sync-slack\", \"schedule\": \"0 */4 * * *\" }"

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
    console.log('Starting Slack metrics sync...');
    await syncSlackMetrics(7); // Sync last 7 days
    console.log('Slack metrics sync completed');

    return NextResponse.json({
      success: true,
      message: 'Slack metrics synced successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error syncing Slack metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
