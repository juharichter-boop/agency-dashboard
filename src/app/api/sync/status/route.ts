import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Auth check disabled - TODO: re-enable when Clerk is properly configured

    const syncLogs = await prisma.syncLog.findMany();

    type SyncLog = typeof syncLogs[0];

    return NextResponse.json({
      syncs: syncLogs.map((log: SyncLog) => ({
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
