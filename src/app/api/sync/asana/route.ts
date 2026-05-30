import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

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

    if (tasks.length === 0) {
      return NextResponse.json({ message: 'No tasks found', synced: 0 });
    }

    // Sync tasks to database
    let synced = 0;
    for (const task of tasks) {
      try {
        await prisma.asanaTask.upsert({
          where: { externalId: task.gid },
          update: {
            name: task.name,
            status: task.completed ? 'COMPLETED' : 'OPEN',
            dueDate: task.due_on ? new Date(task.due_on) : null,
            assigneeName: task.assignee?.name || null,
          },
          create: {
            externalId: task.gid,
            name: task.name,
            status: task.completed ? 'COMPLETED' : 'OPEN',
            dueDate: task.due_on ? new Date(task.due_on) : null,
            assigneeName: task.assignee?.name || null,
          },
        });
        synced++;
      } catch (err) {
        console.error(`Error syncing task ${task.gid}:`, err);
      }
    }

    console.log(`Asana sync complete: ${synced} tasks synced`);
    return NextResponse.json({ message: 'Asana sync complete', synced });
  } catch (error) {
    console.error('Asana sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Asana data' },
      { status: 500 }
    );
  }
}
