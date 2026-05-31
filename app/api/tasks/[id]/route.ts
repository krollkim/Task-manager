import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Check auth (extract user ID from JWT/session)
    // TODO: Fetch task from MongoDB using getTask(taskId, userId)
    // TODO: Verify user owns this task
    // TODO: Return task

    const task = {
      _id: taskId,
      task: 'Stub Task',
      description: 'This is a stub task',
      status: 'todo',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch task',
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

    // TODO: Check auth (extract user ID from JWT/session)
    // TODO: Call editTask(taskId, updatedData, userId)
    // TODO: Verify user owns this task
    // TODO: Return updated task

    const editedTask = {
      _id: taskId,
      task: updatedData.task || 'Updated Task',
      description: updatedData.description || '',
      status: updatedData.status || 'todo',
      priority: updatedData.priority || 'medium',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: editedTask,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task',
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

    // TODO: Check auth (extract user ID from JWT/session)
    // TODO: Call deleteTask(taskId, userId)
    // TODO: Verify user owns this task
    // TODO: Return success response

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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete task',
      },
      { status: 500 }
    );
  }
}
