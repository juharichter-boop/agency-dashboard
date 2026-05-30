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
    console.log('Fetching Slack metrics...');

    // Try to get conversation list
    const convResponse = await fetch('https://slack.com/api/conversations.list?exclude_archived=true&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const convData = await convResponse.json();
    console.log('Slack conversations response:', convData.ok ? 'success' : convData.error);

    if (!convData.ok) {
      // Token doesn't have permission to list conversations, return placeholder
      return {
        totalMessages: 0,
        totalFiles: 0,
        activeUsers: 0,
      };
    }

    const conversations = convData.channels || [];
    let totalMessages = 0;
    let totalFiles = 0;
    const users = new Set<string>();

    // Get message counts from channels
    const sevenDaysAgo = Math.floor(subDays(new Date(), 7).getTime() / 1000);

    for (const conv of conversations.slice(0, 5)) {
      try {
        const historyResponse = await fetch(
          `https://slack.com/api/conversations.history?channel=${conv.id}&oldest=${sevenDaysAgo}&limit=100`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          if (historyData.ok) {
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
    return NextResponse.json({
      message: 'Slack sync failed',
      metrics: { totalMessages: 0, totalFiles: 0, activeUsers: 0 },
    });
  }
}
