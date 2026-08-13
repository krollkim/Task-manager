import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthenticatedUser, respondUnauthorized } from '@/lib/auth';
import Task from '@/models/mongoDB/Task';
import Note from '@/models/mongoDB/Note';
import Meeting from '@/models/mongoDB/Meeting';
import { expandInRange, toDateStr } from '@/utils/rruleExpander';

function toDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// GET /api/agenda/month?year=YYYY&month=M
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '', 10);
    const month = parseInt(searchParams.get('month') || '', 10);

    if (!searchParams.has('year') || !searchParams.has('month') || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'year and month are required (month is 1-based, 1–12).' },
        { status: 400 }
      );
    }

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const userId = user.id;
    const monthRange = { $gte: startOfMonth, $lte: endOfMonth };

    const [tasks, notes, regularMeetings, recurringBases] = await Promise.all([
      Task.find({ userId, dueDate: monthRange }),
      Note.find({ userId, date: monthRange }),
      Meeting.find({ userId, date: monthRange, isRecurringBase: { $ne: true } }),
      Meeting.find({ userId, isRecurringBase: true }),
    ]);

    const virtualMeetings = recurringBases.flatMap(m => expandInRange(m, startOfMonth, endOfMonth));
    const allMeetings = [...regularMeetings, ...virtualMeetings];

    const dayMap = new Map();

    const ensureDay = (key: string) => {
      if (!dayMap.has(key)) {
        const [y, m, d] = key.split('-').map(Number);
        const dateObj = new Date(Date.UTC(y, m - 1, d));
        const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        dayMap.set(key, { date: dateObj, label, agenda: { tasks: [], notes: [], meetings: [] } });
      }
      return dayMap.get(key);
    };

    for (const task of tasks) {
      if (task.dueDate) {
        ensureDay(toDateString(new Date(task.dueDate))).agenda.tasks.push(task);
      }
    }
    for (const note of notes) {
      if (note.date) {
        ensureDay(toDateString(new Date(note.date))).agenda.notes.push(note);
      }
    }
    for (const meeting of allMeetings) {
      if (meeting.date) {
        ensureDay(toDateString(new Date(meeting.date))).agenda.meetings.push(meeting);
      }
    }

    const result = Array.from(dayMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
