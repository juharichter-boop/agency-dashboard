import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

async function fetchSlackMetrics() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error('SLACK_BOT_TOKEN not set');
  }

  try {
    // Fetch conversations
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

    // Get message counts for each conversation from last 7 days
    const sevenDaysAgo = Math.floor(subDays(new Date(), 7).getTime() / 1000);
    let totalMessages = 0;
    let totalFiles = 0;
    const userMetrics: Record<string, { messages: number; files: number }> = {};

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

          // Count files
          const filesInConv = messages.filter((m: any) => m.files && m.files.length > 0).length;
          totalFiles += filesInConv;

          // Track user activity
          for (const msg of messages) {
            if (msg.user) {
              if (!userMetrics[msg.user]) {
                userMetrics[msg.user] = { messages: 0, files: 0 };
              }
              userMetrics[msg.user].messages++;
              if (msg.files) {
                userMetrics[msg.user].files += msg.files.length;
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching channel ${conv.id} history:`, err);
      }
    }

    return {
      totalMessages,
      totalFiles,
      activeUsers: Object.keys(userMetrics).length,
      userMetrics,
    };
  } catch (error) {
    console.error('Error fetching Slack metrics:', error);
    return { totalMessages: 0, totalFiles: 0, activeUsers: 0, userMetrics: {} };
  }
}

export async function POST() {
  try {
    console.log('Starting Slack sync...');
    const metrics = await fetchSlackMetrics();

    // Store metrics for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.slackMetric.upsert({
      where: { date: today },
      update: {
        messageCount: metrics.totalMessages,
        fileCount: metrics.totalFiles,
        activeUsers: metrics.activeUsers,
      },
      create: {
        date: today,
        messageCount: metrics.totalMessages,
        fileCount: metrics.totalFiles,
        activeUsers: metrics.activeUsers,
      },
    });

    console.log(`Slack sync complete: ${metrics.totalMessages} messages, ${metrics.totalFiles} files`);
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
