import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthenticatedUser, respondUnauthorized } from '@/lib/auth';
import Task from '@/models/mongoDB/Task';
import { getTasks, createTask, getTask, deleteTask, editTask } from '@/models/TaskAccessDataService';

// GET /api/tasks
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const tasks = await getTasks(user.id);
    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const body = await request.json();
    const { task, description, status, priority, dueDate, estimateMinutes } = body;

    if (!task || typeof task !== 'string' || task.trim() === '') {
      return NextResponse.json(
        { error: 'Task is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    const taskData = {
      task: task.trim(),
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      userId: user.id,
      ...(dueDate && { dueDate }),
      ...(estimateMinutes !== undefined && { estimateMinutes }),
    };

    const newTask = await createTask(taskData);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
