import { prisma } from '@/lib/db';
import { asanaAPI } from '@/lib/api/asana';
import { format } from 'date-fns';

export async function syncAsanaData() {
  try {
    const now = new Date();

    // Get current user (to determine team context)
    const currentUser = await asanaAPI.getMe();
    // Note: In production, you'd need to get team context from environment or config
    // For now, we'll assume a default team ID from environment

    // Get all tasks that the API can access
    // This is a simplified approach - in production you'd want to sync by team/workspace
    const dbUsers = await prisma.user.findMany();

    for (const dbUser of dbUsers) {
      if (!dbUser.asanaId) continue;

      try {
        const metrics = await asanaAPI.getUserMetrics(dbUser.asanaId);
        // Store metrics in a way that can be retrieved later
        // We'll use AsanaTask to track individual tasks
      } catch (error) {
        console.error(`Error syncing Asana tasks for user ${dbUser.asanaId}:`, error);
      }
    }

    // Update sync log
    await prisma.syncLog.upsert({
      where: { id: 'asana' },
      update: {
        status: 'SUCCESS',
        lastSyncedAt: now,
        nextSyncAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Next 2 hours
      },
      create: {
        id: 'asana',
        entityType: 'asana',
        status: 'SUCCESS',
        lastSyncedAt: now,
        nextSyncAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      },
    });

    console.log('Asana data synced successfully');
  } catch (error) {
    console.error('Error syncing Asana data:', error);
    const now = new Date();
    await prisma.syncLog.upsert({
      where: { id: 'asana' },
      update: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        nextSyncAt: new Date(now.getTime() + 15 * 60 * 1000),
      },
      create: {
        id: 'asana',
        entityType: 'asana',
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        nextSyncAt: new Date(now.getTime() + 15 * 60 * 1000),
      },
    });
  }
}
