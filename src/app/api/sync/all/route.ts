import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST() {
  try {
    console.log('Starting full sync...');

    // Run all syncs in parallel
    const [asanaRes, harvestRes, slackRes] = await Promise.all([
      fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/sync/asana`, {
        method: 'POST',
      }),
      fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/sync/harvest`, {
        method: 'POST',
      }),
      fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/sync/slack`, {
        method: 'POST',
      }),
    ]);

    const asanaData = await asanaRes.json();
    const harvestData = await harvestRes.json();
    const slackData = await slackRes.json();

    return NextResponse.json({
      message: 'Full sync complete',
      syncs: {
        asana: asanaData,
        harvest: harvestData,
        slack: slackData,
      },
    });
  } catch (error) {
    console.error('Full sync error:', error);
    return NextResponse.json(
      { error: 'Failed to run full sync' },
      { status: 500 }
    );
  }
}
