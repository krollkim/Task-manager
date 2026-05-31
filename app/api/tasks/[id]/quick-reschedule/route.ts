import { NextRequest, NextResponse } from 'next/server';
import { quickReschedule } from '@/lib/services/taskService';
import { extractUserId } from '@/lib/auth';

/**
 * PATCH /api/tasks/[id]/quick-reschedule
 * Quickly reschedule a task (for 📅 button quick actions: Tomorrow +1d or Next Week +7d)
 * Body: { dueDate: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const body = await request.json();

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task ID is required',
        },
        { status: 400 }
      );
    }

    if (!body.dueDate || typeof body.dueDate !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'dueDate is required and must be a string (ISO format)',
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

    const rescheduledTask = await quickReschedule(taskId, userId, body.dueDate);

    return NextResponse.json(
      {
        success: true,
        message: 'Task rescheduled successfully',
        data: rescheduledTask,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to reschedule task';

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

    if (errorMessage.includes('required')) {
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
