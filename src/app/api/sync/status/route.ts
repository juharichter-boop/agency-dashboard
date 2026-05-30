import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const syncLogs = await prisma.syncLog.findMany();

    return NextResponse.json({
      syncs: syncLogs.map((log) => ({
        entityType: log.entityType,
        status: log.status,
        lastSyncedAt: log.lastSyncedAt,
        nextSyncAt: log.nextSyncAt,
        errorMessage: log.errorMessage,
      })),
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}
