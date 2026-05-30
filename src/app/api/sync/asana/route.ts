import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function fetchAsanaTasks() {
  const token = process.env.ASANA_PERSONAL_ACCESS_TOKEN;
  if (!token) {
    throw new Error('ASANA_PERSONAL_ACCESS_TOKEN not set');
  }

  try {
    const response = await fetch('https://app.asana.com/api/1.0/tasks?opt_fields=name,completed,due_on,assignee.name', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Asana API error: ${response.statusText}`);
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
      { error: 'Failed to sync Asana data' },
      { status: 500 }
    );
  }
}
