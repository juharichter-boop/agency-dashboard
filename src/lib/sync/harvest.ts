import { prisma } from '@/lib/db';
import { harvestAPI } from '@/lib/api/harvest';
import { subDays, format } from 'date-fns';

export async function syncHarvestData(daysBack: number = 30) {
  try {
    const now = new Date();
    const dateStart = format(subDays(now, daysBack), 'YYYY-MM-DD');
    const dateEnd = format(now, 'YYYY-MM-DD');

    // Sync users
    const harvestUsers = await harvestAPI.getUsers();
    for (const hUser of harvestUsers) {
      let dbUser = await prisma.user.findUnique({
        where: { email: hUser.email },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: hUser.email,
            name: hUser.name,
            harvestId: hUser.id,
          },
        });
      } else if (!dbUser.harvestId) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { harvestId: hUser.id },
        });
      }
    }

    // Sync projects and clients
    const harvestClients = await harvestAPI.getClients();
    const clientMap = new Map<number, string>();

    for (const hClient of harvestClients) {
      const dbClient = await prisma.client.upsert({
        where: { externalId: String(hClient.id) },
        update: { name: hClient.name },
        create: {
          name: hClient.name,
          externalId: String(hClient.id),
        },
      });
      clientMap.set(hClient.id, dbClient.id);
    }

    const harvestProjects = await harvestAPI.getProjects();
    for (const hProject of harvestProjects) {
      const clientId = hProject.client_id ? clientMap.get(hProject.client_id) : undefined;
      await prisma.project.upsert({
        where: { externalId: String(hProject.id) },
        update: {
          name: hProject.name,
          clientId,
          budget: hProject.budget ? Math.round(hProject.budget * 100) / 100 : undefined,
        },
        create: {
          name: hProject.name,
          externalId: String(hProject.id),
          clientId,
          budget: hProject.budget ? Math.round(hProject.budget * 100) / 100 : 0,
          status: hProject.is_active ? 'ACTIVE' : 'COMPLETED',
        },
      });
    }

    // Sync time entries
    const timeEntries = await harvestAPI.getTimeEntries(dateStart, dateEnd);

    for (const entry of timeEntries) {
      const dbUser = await prisma.user.findUnique({
        where: { harvestId: entry.user_id },
      });

      const dbProject = await prisma.project.findUnique({
        where: { externalId: String(entry.project_id) },
      });

      if (dbUser && dbProject) {
        const amount = entry.amount || entry.hours * (entry.billable_rate || 0);
        await prisma.harvestEntry.upsert({
          where: {
            id: `harvest-${entry.id}`,
          },
          update: {
            hours: BigInt(Math.round(entry.hours * 100)),
            billable: entry.billable,
            amount: BigInt(Math.round(amount * 100)),
          },
          create: {
            id: `harvest-${entry.id}`,
            userId: dbUser.id,
            projectId: dbProject.id,
            date: new Date(entry.spent_date),
            hours: BigInt(Math.round(entry.hours * 100)),
            billable: entry.billable,
            amount: BigInt(Math.round(amount * 100)),
          },
        });
      }
    }

    // Update sync log
    await prisma.syncLog.upsert({
      where: { id: 'harvest' },
      update: {
        status: 'SUCCESS',
        lastSyncedAt: now,
        nextSyncAt: new Date(now.getTime() + 6 * 60 * 60 * 1000), // Next 6 hours
      },
      create: {
        id: 'harvest',
        entityType: 'harvest',
        status: 'SUCCESS',
        lastSyncedAt: now,
        nextSyncAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
      },
    });

    console.log('Harvest data synced successfully');
  } catch (error) {
    console.error('Error syncing Harvest data:', error);
    const now = new Date();
    await prisma.syncLog.upsert({
      where: { id: 'harvest' },
      update: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        nextSyncAt: new Date(now.getTime() + 15 * 60 * 1000), // Retry in 15 minutes
      },
      create: {
        id: 'harvest',
        entityType: 'harvest',
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        nextSyncAt: new Date(now.getTime() + 15 * 60 * 1000),
      },
    });
  }
}
