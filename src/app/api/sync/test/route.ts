import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {
    asanaToken: process.env.ASANA_PERSONAL_ACCESS_TOKEN ? '✓ Set' : '✗ Missing',
    harvestToken: process.env.HARVEST_ACCESS_TOKEN ? '✓ Set' : '✗ Missing',
    harvestAccountId: process.env.HARVEST_ACCOUNT_ID ? '✓ Set' : '✗ Missing',
    slackToken: process.env.SLACK_BOT_TOKEN ? '✓ Set' : '✗ Missing',
  };

  return NextResponse.json({ diagnostics });
}

export async function POST() {
  try {
    const asanaToken = process.env.ASANA_PERSONAL_ACCESS_TOKEN;

    if (!asanaToken) {
      return NextResponse.json(
        { error: 'ASANA_PERSONAL_ACCESS_TOKEN not found' },
        { status: 400 }
      );
    }

    // Test Asana API
    const response = await fetch('https://app.asana.com/api/1.0/tasks?limit=1', {
      headers: {
        'Authorization': `Bearer ${asanaToken}`,
      },
    });

    const data = await response.json();

    return NextResponse.json({
      message: 'Asana API test',
      status: response.status,
      success: response.ok,
      data: response.ok ? 'Connected!' : data.errors?.[0]?.message || 'Unknown error',
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
