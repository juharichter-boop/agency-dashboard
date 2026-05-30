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
      console.log('Fetching Asana user info...');
      const userRes = await fetch('https://app.asana.com/api/1.0/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log(`User response status: ${userRes.status}`);

      if (userRes.ok) {
        const userData = await userRes.json();
        console.log('User data received:', userData.data ? 'OK' : 'Empty');
        // Asana uses 'gid' (global ID) not 'id'
        const workspaceId = userData.data?.workspaces?.[0]?.gid;
        console.log(`Workspace ID: ${workspaceId}`);

        if (workspaceId) {
          const userId = userData.data?.gid;
          console.log(`Fetching tasks assigned to user ${userId} in workspace ${workspaceId}...`);
          // Get tasks assigned to the current user in the workspace
          const tasksRes = await fetch(
            `https://app.asana.com/api/1.0/tasks?assignee=${userId}&workspace=${workspaceId}&limit=50`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          console.log(`Tasks response status: ${tasksRes.status}`);

          if (tasksRes.ok) {
            const tasksData = await tasksRes.json();
            const tasks = tasksData.data || [];
            console.log(`Found ${tasks.length} tasks`);
            const completedCount = tasks.filter((t: any) => t.completed).length;

            return NextResponse.json({
              message: 'Asana sync complete',
              synced: tasks.length,
              completed: completedCount,
              open: tasks.length - completedCount,
            });
          } else {
            const errorData = await tasksRes.json();
            console.error('Tasks API error response:', errorData);
          }
        } else {
          console.log('No workspace found in user data');
        }
      } else {
        const errorData = await userRes.json();
        console.error('User API error response:', errorData);
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
