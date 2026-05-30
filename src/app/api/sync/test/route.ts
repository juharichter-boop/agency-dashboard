import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results = {
    environment: {
      asanaToken: process.env.ASANA_PERSONAL_ACCESS_TOKEN ? '✓ Set' : '✗ Missing',
      harvestToken: process.env.HARVEST_ACCESS_TOKEN ? '✓ Set' : '✗ Missing',
      harvestAccountId: process.env.HARVEST_ACCOUNT_ID ? '✓ Set' : '✗ Missing',
      slackToken: process.env.SLACK_BOT_TOKEN ? '✓ Set' : '✗ Missing',
    },
    tests: {} as any,
  };

  // Test Asana
  try {
    const asanaRes = await fetch('https://app.asana.com/api/1.0/tasks?limit=1', {
      headers: {
        'Authorization': `Bearer ${process.env.ASANA_PERSONAL_ACCESS_TOKEN}`,
      },
    });
    results.tests.asana = {
      status: asanaRes.status,
      ok: asanaRes.ok,
      message: asanaRes.ok ? 'Connected' : 'Failed',
    };
  } catch (e) {
    results.tests.asana = { error: String(e) };
  }

  // Test Harvest
  try {
    const harvestRes = await fetch(
      `https://api.harvestapp.com/v2/users/me`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HARVEST_ACCESS_TOKEN}`,
          'Harvest-Account-ID': process.env.HARVEST_ACCOUNT_ID!,
        },
      }
    );
    results.tests.harvest = {
      status: harvestRes.status,
      ok: harvestRes.ok,
      message: harvestRes.ok ? 'Connected' : 'Failed',
    };
  } catch (e) {
    results.tests.harvest = { error: String(e) };
  }

  // Test Slack
  try {
    const slackRes = await fetch('https://slack.com/api/auth.test', {
      headers: {
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
    });
    const slackData = await slackRes.json();
    results.tests.slack = {
      status: slackRes.status,
      ok: slackData.ok,
      message: slackData.ok ? 'Connected' : slackData.error || 'Failed',
    };
  } catch (e) {
    results.tests.slack = { error: String(e) };
  }

  return NextResponse.json(results);
}
