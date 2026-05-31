import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, createTask } from '@/lib/services/taskService';
import { extractUserId } from '@/lib/auth';

/**
 * GET /api/tasks
 * Fetch all tasks for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Extract user ID from request headers
    const userId = extractUserId(request.headers);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: No valid authentication token provided',
        },
        { status: 401 }
      );
    }

    const tasks = await getAllTasks(userId);

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

    // Extract user ID from request headers
    const userId = extractUserId(request.headers);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: No valid authentication token provided',
        },
        { status: 401 }
      );
    }

    const newTask = await createTask(userId, {
      task: body.task.trim(),
      description: body.description || '',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      ...(body.dueDate && { dueDate: body.dueDate }),
      ...(body.estimateMinutes !== undefined && { estimateMinutes: body.estimateMinutes }),
      ...(body.linkedMeetingId && { linkedMeetingId: body.linkedMeetingId }),
      ...(body.linkedNoteIds && { linkedNoteIds: body.linkedNoteIds }),
      ...(body.tags && { tags: body.tags }),
      ...(body.teamId && { teamId: body.teamId }),
    });

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
