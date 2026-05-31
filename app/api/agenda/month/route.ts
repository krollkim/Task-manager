import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/agenda/month?year=YYYY&month=MM
 *
 * Fetch agenda (tasks, notes, meetings) for a specific month.
 * Month parameter is 1-based (1–12).
 *
 * Returns an array of days in the month with grouped agenda items.
 *
 * Response format: MonthAgendaDay[]
 *   {
 *     date: Date,
 *     label: string, // e.g., "Mon 15"
 *     agenda: {
 *       tasks: Task[],
 *       notes: Note[],
 *       meetings: Meeting[]
 *     }
 *   }
 */
export async function GET(request: NextRequest) {
  try {
    const yearParam = request.nextUrl.searchParams.get('year');
    const monthParam = request.nextUrl.searchParams.get('month');

    if (!yearParam || !monthParam) {
      return NextResponse.json(
        { error: 'year and month are required (month is 1-based, 1–12).' },
        { status: 400 }
      );
    }

    const year = parseInt(yearParam, 10);
    const month = parseInt(monthParam, 10);

    if (
      isNaN(year) ||
      isNaN(month) ||
      month < 1 ||
      month > 12
    ) {
      return NextResponse.json(
        { error: 'year and month are required (month is 1-based, 1–12).' },
        { status: 400 }
      );
    }

    // TODO: Extract user from auth session
    // const userId = request.headers.get('x-user-id');
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // TODO: Implement month logic
    // 1. Calculate start and end of month (UTC)
    // 2. Query MongoDB for tasks, notes, and meetings across the month
    // 3. Expand recurring meetings for each day
    // 4. Build day map keyed by YYYY-MM-DD
    // 5. Apply sorting: meetings by startTime, tasks by priority, notes by createdAt
    // 6. Return array sorted by date

    // Placeholder response
    const monthAgenda = [];

    return NextResponse.json(
      {
        success: true,
        data: monthAgenda,
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
