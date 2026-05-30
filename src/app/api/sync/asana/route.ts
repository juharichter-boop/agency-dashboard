import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST() {
  try {
    console.log('Starting Asana sync...');
    const token = process.env.ASANA_PERSONAL_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json({
        message: 'Asana token not configured',
        synced: 0,
        completed: 0,
        open: 0,
      });
    }

    try {
      // Try to fetch from Asana
      const userRes = await fetch('https://app.asana.com/api/1.0/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        const workspaceId = userData.data?.workspaces?.[0]?.id;

        if (workspaceId) {
          const tasksRes = await fetch(
            `https://app.asana.com/api/1.0/workspaces/${workspaceId}/tasks?limit=50`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          if (tasksRes.ok) {
            const tasksData = await tasksRes.json();
            const tasks = tasksData.data || [];
            const completedCount = tasks.filter((t: any) => t.completed).length;

            return NextResponse.json({
              message: 'Asana sync complete',
              synced: tasks.length,
              completed: completedCount,
              open: tasks.length - completedCount,
            });
          }
        }
      }
    } catch (apiError) {
      console.error('Asana API error:', apiError);
    }

    // Return empty result if API fails
    return NextResponse.json({
      message: 'Asana sync - no data available',
      synced: 0,
      completed: 0,
      open: 0,
    });
  } catch (error) {
    console.error('Asana sync error:', error);
    return NextResponse.json({
      message: 'Asana sync - error',
      synced: 0,
      completed: 0,
      open: 0,
    });
  }
}
