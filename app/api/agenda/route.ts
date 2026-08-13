import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthenticatedUser, respondUnauthorized } from '@/lib/auth';
import Task from '@/models/mongoDB/Task';
import Note from '@/models/mongoDB/Note';
import Meeting from '@/models/mongoDB/Meeting';
import { expandInRange } from '@/utils/rruleExpander';

// GET /api/agenda?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'date query parameter is required (YYYY-MM-DD).' },
        { status: 400 }
      );
    }

    const parsed = new Date(date + 'T00:00:00.000Z');
    if (isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
    const userId = user.id;
    const dayRange = { $gte: startOfDay, $lte: endOfDay };

    const [tasks, notes, regularMeetings, recurringBases] = await Promise.all([
      Task.find({ userId, dueDate: dayRange }),
      Note.find({ userId, date: dayRange }),
      Meeting.find({ userId, date: dayRange, isRecurringBase: { $ne: true } }),
      Meeting.find({ userId, isRecurringBase: true }),
    ]);

    const virtualMeetings = recurringBases.flatMap(m => expandInRange(m, startOfDay, endOfDay));
    const meetings = [...regularMeetings, ...virtualMeetings];

    return NextResponse.json({ tasks, notes, meetings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
