import { NextRequest, NextResponse } from 'next/server';
import { getTaskById, updateTask, deleteTask } from '@/lib/services/taskService';
import { extractUserId } from '@/lib/auth';

/**
 * GET /api/tasks/[id]
 * Fetch a single task by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task ID is required',
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

    const task = await getTaskById(taskId, userId);

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch task';

    if (errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/[id]
 * Update a task
 * Body: Partial task fields to update (task, description, status, priority, dueDate, estimateMinutes, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const updatedData = await request.json();

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task ID is required',
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

    const editedTask = await updateTask(taskId, userId, updatedData);

    return NextResponse.json(
      {
        success: true,
        data: editedTask,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update task';

    if (errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 403 }
      );
    }

    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 404 }
      );
    }

    if (errorMessage.includes('Invalid')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task ID is required',
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

    await deleteTask(taskId, userId);

    return NextResponse.json(
      {
        success: true,
        message: 'Task deleted successfully',
        data: {
          _id: taskId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';

    if (errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 403 }
      );
    }

    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
