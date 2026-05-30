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
    const userRes = await fetch('https://app.asana.com/api/1.0/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.ASANA_PERSONAL_ACCESS_TOKEN}`,
      },
    });

    if (!userRes.ok) {
      const error = await userRes.text();
      results.tests.asana = {
        status: userRes.status,
        ok: false,
        message: `User endpoint failed: ${error.substring(0, 100)}`,
      };
    } else {
      const userData = await userRes.json();
      const workspaceId = userData.data?.workspaces?.[0]?.id;

      results.tests.asana = {
        status: userRes.status,
        ok: true,
        workspaceId: workspaceId || 'Not found',
        message: workspaceId ? 'Workspace found' : 'No workspaces',
      };
    }
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
