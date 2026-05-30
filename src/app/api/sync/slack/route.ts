import { NextResponse } from 'next/server';
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function fetchSlackMetrics() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error('SLACK_BOT_TOKEN not set');
  }

  try {
    const convResponse = await fetch('https://slack.com/api/conversations.list?exclude_archived=true', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!convResponse.ok) {
      throw new Error(`Slack API error: ${convResponse.statusText}`);
    }

    const convData = await convResponse.json();
    const conversations = convData.channels || [];

    const sevenDaysAgo = Math.floor(subDays(new Date(), 7).getTime() / 1000);
    let totalMessages = 0;
    let totalFiles = 0;
    const users = new Set<string>();

    for (const conv of conversations.slice(0, 10)) {
      try {
        const historyResponse = await fetch(
          `https://slack.com/api/conversations.history?channel=${conv.id}&oldest=${sevenDaysAgo}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          const messages = historyData.messages || [];
          totalMessages += messages.length;

          const filesInConv = messages.filter((m: any) => m.files && m.files.length > 0).length;
          totalFiles += filesInConv;

          for (const msg of messages) {
            if (msg.user) {
              users.add(msg.user);
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching channel ${conv.id}:`, err);
      }
    }

    return {
      totalMessages,
      totalFiles,
      activeUsers: users.size,
    };
  } catch (error) {
    console.error('Error fetching Slack metrics:', error);
    return { totalMessages: 0, totalFiles: 0, activeUsers: 0 };
  }
}

export async function POST() {
  try {
    console.log('Starting Slack sync...');
    const metrics = await fetchSlackMetrics();

    return NextResponse.json({
      message: 'Slack sync complete',
      metrics,
    });
  } catch (error) {
    console.error('Slack sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Slack data' },
      { status: 500 }
    );
  }
}
