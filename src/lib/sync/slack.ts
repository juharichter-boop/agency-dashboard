import { prisma } from '@/lib/db';
import { slackAPI } from '@/lib/api/slack';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export async function syncSlackMetrics(daysBack: number = 7) {
  try {
    const syncLog = await prisma.syncLog.findUnique({
      where: { id: 'slack' },
    });

    const now = new Date();
    const dateStart = format(subDays(now, daysBack), 'yyyy-MM-dd');
    const dateEnd = format(now, 'yyyy-MM-dd');

    // Get all Slack users
    const slackUsers = await slackAPI.getUsers();

    // Sync user data
    for (const slackUser of slackUsers) {
      // Skip bot users
      if (slackUser.id === 'USLACKBOT' || slackUser.profile?.email?.endsWith('@slackbot.com')) {
        continue;
      }

      // Find or create user in database
      let dbUser = await prisma.user.findUnique({
        where: { email: slackUser.profile?.email || slackUser.name },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: slackUser.profile?.email || `${slackUser.name}@slack.internal`,
            name: slackUser.profile?.display_name || slackUser.name,
            slackId: slackUser.id,
          },
        });
      } else if (!dbUser.slackId) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { slackId: slackUser.id },
        });
      }

      // Get user activity for the date range
      try {
        const activity = await slackAPI.getUserActivity(slackUser.id, dateStart, dateEnd);

        // Store metrics
        await prisma.slackMetric.create({
          data: {
            userId: dbUser.id,
            date: new Date(dateStart),
            messageCount: activity.messageCount,
            fileCount: activity.fileCount,
            isBot: activity.isBot,
          },
        });
      } catch (error) {
        console.error(`Error syncing activity for user ${slackUser.id}:`, error);
      }
    }

    // Update sync log
    await prisma.syncLog.upsert({
      where: { id: 'slack' },
      update: {
        status: 'SUCCESS',
        lastSyncedAt: now,
        nextSyncAt: new Date(now.getTime() + 60 * 60 * 1000), // Next hour
      },
      create: {
        id: 'slack',
        entityType: 'slack',
        status: 'SUCCESS',
        lastSyncedAt: now,
        nextSyncAt: new Date(now.getTime() + 60 * 60 * 1000),
      },
    });

    console.log('Slack metrics synced successfully');
  } catch (error) {
    console.error('Error syncing Slack metrics:', error);
    const now = new Date();
    await prisma.syncLog.upsert({
      where: { id: 'slack' },
      update: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        nextSyncAt: new Date(now.getTime() + 15 * 60 * 1000), // Retry in 15 minutes
      },
      create: {
        id: 'slack',
        entityType: 'slack',
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        nextSyncAt: new Date(now.getTime() + 15 * 60 * 1000),
      },
    });
  }
}
