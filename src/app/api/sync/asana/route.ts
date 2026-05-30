import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function fetchAsanaTasks() {
  const token = process.env.ASANA_PERSONAL_ACCESS_TOKEN;
  if (!token) {
    throw new Error('ASANA_PERSONAL_ACCESS_TOKEN not set');
  }

  try {
    // First get the user to find their workspace
    const userResponse = await fetch('https://app.asana.com/api/1.0/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Asana user API error: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    const workspaceId = userData.data?.workspaces?.[0]?.id;

    if (!workspaceId) {
      console.warn('No workspace found in Asana');
      return [];
    }

    // Now fetch tasks from the workspace
    const response = await fetch(
      `https://app.asana.com/api/1.0/workspaces/${workspaceId}/tasks?opt_fields=name,completed,due_on,assignee.name&limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Asana tasks API error: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching Asana tasks:', error);
    return [];
  }
}

export async function POST() {
  try {
    console.log('Starting Asana sync...');
    const tasks = await fetchAsanaTasks();

    const completedCount = tasks.filter((t: any) => t.completed).length;
    const openCount = tasks.length - completedCount;

    return NextResponse.json({
      message: 'Asana sync complete',
      synced: tasks.length,
      completed: completedCount,
      open: openCount,
    });
  } catch (error) {
    console.error('Asana sync error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
