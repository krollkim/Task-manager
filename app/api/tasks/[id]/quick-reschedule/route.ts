import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Check auth (extract user ID from JWT/session)
    // TODO: Call editTask(taskId, { dueDate: body.dueDate }, userId)
    // TODO: Verify user owns this task
    // TODO: Return updated task with new dueDate

    const rescheduledTask = {
      _id: taskId,
      dueDate: body.dueDate,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Task rescheduled successfully',
        data: rescheduledTask,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reschedule task',
      },
      { status: 500 }
    );
  }
}
