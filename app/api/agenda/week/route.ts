import { NextRequest, NextResponse } from 'next/server';
import { getAgendaForWeek } from '@/lib/services/agendaService';

/**
 * GET /api/agenda/week?date=YYYY-MM-DD
 *
 * Fetch agenda (tasks, notes, meetings) for the week containing the given date.
 * Returns an array of 7 days (Mon–Sun) with grouped agenda items.
 *
 * Response format: WeekAgendaDay[]
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
    // For now, use a hardcoded userId for testing
    const userId = process.env.TEST_USER_ID || 'test-user';

    const weekAgenda = await getAgendaForWeek(userId, date);

    return NextResponse.json(
      {
        success: true,
        data: weekAgenda,
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
