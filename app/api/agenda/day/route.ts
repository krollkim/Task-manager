import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/agenda/day?date=YYYY-MM-DD
 *
 * Fetch agenda (tasks, notes, meetings) for a specific day.
 * Returns items sorted by category and relevance:
 *   - Meetings: by startTime
 *   - Tasks: by priority
 *   - Notes: by createdAt (descending)
 */
export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'date query parameter is required (YYYY-MM-DD).' },
        { status: 400 }
      );
    }

    // Validate date format
    const parsed = new Date(date + 'T00:00:00.000Z');
    if (isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    // TODO: Extract user from auth session
    // const userId = request.headers.get('x-user-id');
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // TODO: Query MongoDB for tasks, notes, and meetings
    // const startOfDay = new Date(date + 'T00:00:00.000Z');
    // const endOfDay = new Date(date + 'T23:59:59.999Z');
    // const dayRange = { $gte: startOfDay, $lte: endOfDay };
    //
    // const [tasks, notes, regularMeetings, recurringBases] = await Promise.all([
    //   Task.find({ userId, dueDate: dayRange }),
    //   Note.find({ userId, date: dayRange }),
    //   Meeting.find({ userId, date: dayRange, isRecurringBase: { $ne: true } }),
    //   Meeting.find({ userId, isRecurringBase: true }),
    // ]);
    //
    // const virtualMeetings = recurringBases.flatMap(m => expandInRange(m, startOfDay, endOfDay));
    // const meetings = [...regularMeetings, ...virtualMeetings];
    //
    // Apply sorting logic here

    const tasks = [];
    const notes = [];
    const meetings = [];

    return NextResponse.json(
      {
        success: true,
        data: {
          tasks,
          notes,
          meetings,
          date,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
