import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/tasks
 * Fetch all tasks for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Check auth (extract user ID from JWT/session)
    // TODO: Fetch tasks from MongoDB using getTasks(userId)
    // TODO: Return tasks array

    const tasks = [
      // Placeholder
    ];

    return NextResponse.json(
      {
        success: true,
        data: tasks,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task
 * Body: { task: string, description?: string, status?: string, priority?: string, dueDate?: string, estimateMinutes?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.task || typeof body.task !== 'string' || body.task.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Task is required and must be a non-empty string.',
        },
        { status: 400 }
      );
    }

    // TODO: Check auth (extract user ID from JWT/session)
    // TODO: Call createTask(taskData) with validated data
    // TODO: Return created task

    const taskData = {
      task: body.task.trim(),
      description: body.description || '',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      // userId will be set from auth context
      ...(body.dueDate && { dueDate: body.dueDate }),
      ...(body.estimateMinutes !== undefined && { estimateMinutes: body.estimateMinutes }),
    };

    const newTask = {
      _id: 'stub-task-id',
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newTask,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create task',
      },
      { status: 500 }
    );
  }
}
