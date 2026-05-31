import dbConnect from '@/lib/db';
import Task from '@/lib/models/Task';
import Note from '@/lib/models/Note';
import Meeting from '@/lib/models/Meeting';
import { AgendaData, WeekAgendaDay } from '@/types/types';
import { expandInRange, toDateStr } from '@/lib/utils/rruleExpander';

/**
 * Priority sorting order (lower number = higher priority = appears first)
 */
const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Sort agenda items within a single AgendaData:
 * - Meetings: by startTime (with time first, no-time last)
 * - Tasks: by priority
 * - Notes: by createdAt (descending)
 */
function sortAgenda(data: AgendaData): AgendaData {
  const meetings = [...data.meetings].sort((a, b) => {
    const aHas = !!a.startTime;
    const bHas = !!b.startTime;
    if (!aHas && !bHas) return 0;
    if (!aHas) return 1;
    if (!bHas) return -1;
    return a.startTime!.localeCompare(b.startTime!);
  });

  const tasks = [...data.tasks].sort((a, b) => {
    const aPri = a.priority ? PRIORITY_ORDER[a.priority] ?? 4 : 4;
    const bPri = b.priority ? PRIORITY_ORDER[b.priority] ?? 4 : 4;
    return aPri - bPri;
  });

  const notes = [...data.notes].sort((a, b) => {
    return (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  return { meetings, tasks, notes };
}

/**
 * Format a Date as YYYY-MM-DD for query purposes
 */
function formatDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get agenda for a single day (tasks, notes, meetings)
 * Expands recurring meetings for that day
 */
export async function getAgendaForDay(
  userId: string,
  date: string
): Promise<AgendaData> {
  await dbConnect();

  // Parse the date string (YYYY-MM-DD) into start and end of day (UTC)
  const parsed = new Date(date + 'T00:00:00.000Z');
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid date format. Use YYYY-MM-DD.');
  }

  const startOfDay = new Date(parsed);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(parsed);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Query for tasks with dueDate in range
  const tasks = await Task.find({
    userId,
    dueDate: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  // Query for notes with date in range
  const notes = await Note.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  // Query for regular (non-recurring) meetings on this date
  const regularMeetings = await Meeting.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
    isRecurringBase: { $ne: true },
  }).lean();

  // Query for recurring base meetings and expand for this day
  const recurringBases = await Meeting.find({
    userId,
    isRecurringBase: true,
  }).lean();

  const virtualMeetings = recurringBases.flatMap((m) =>
    expandInRange(m, startOfDay, endOfDay)
  );

  const allMeetings = [...regularMeetings, ...virtualMeetings];

  const agendaData: AgendaData = {
    tasks: tasks as any[],
    notes: notes as any[],
    meetings: allMeetings as any[],
  };

  return sortAgenda(agendaData);
}

/**
 * Get agenda for a week (7 days from Monday to Sunday)
 * Returns an array of WeekAgendaDay with grouped items
 */
export async function getAgendaForWeek(
  userId: string,
  dateStr: string
): Promise<WeekAgendaDay[]> {
  await dbConnect();

  // Parse the date string and find the Monday of that week
  const parsed = new Date(dateStr + 'T00:00:00.000Z');
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid date format. Use YYYY-MM-DD.');
  }

  const day = parsed.getUTCDay();
  // Monday = start of week (day 0 = Sunday → offset 6, else offset day-1)
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(parsed);
  monday.setUTCDate(monday.getUTCDate() + mondayOffset);
  monday.setUTCHours(0, 0, 0, 0);

  // Generate 7 days (Mon-Sun)
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() + i);
    days.push(d);
  }

  // Calculate range for single query
  const startOfWeek = new Date(monday);
  startOfWeek.setUTCHours(0, 0, 0, 0);

  const endOfWeek = new Date(monday);
  endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);

  // Query once for all items in the week
  const [allTasks, allNotes, regularMeetings, recurringBases] = await Promise.all([
    Task.find({
      userId,
      dueDate: { $gte: startOfWeek, $lte: endOfWeek },
    }).lean(),
    Note.find({
      userId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
    }).lean(),
    Meeting.find({
      userId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
      isRecurringBase: { $ne: true },
    }).lean(),
    Meeting.find({
      userId,
      isRecurringBase: true,
    }).lean(),
  ]);

  // Expand recurring meetings for entire week
  const virtualMeetings = recurringBases.flatMap((m) =>
    expandInRange(m, startOfWeek, endOfWeek)
  );

  const allMeetings = [...regularMeetings, ...virtualMeetings];

  // Group by day
  const weekAgenda: WeekAgendaDay[] = days.map((d) => {
    const dayStart = new Date(d);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(d);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const dayTasks = allTasks.filter(
      (t) => t.dueDate && t.dueDate >= dayStart && t.dueDate <= dayEnd
    );
    const dayNotes = allNotes.filter(
      (n) => n.date && n.date >= dayStart && n.date <= dayEnd
    );
    const dayMeetings = allMeetings.filter(
      (m) => {
        const mDate = typeof m.date === 'string' ? new Date(m.date) : m.date;
        return mDate >= dayStart && mDate <= dayEnd;
      }
    );

    const dayLabel = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return {
      date: d,
      label: dayLabel,
      agenda: sortAgenda({
        tasks: dayTasks as any[],
        notes: dayNotes as any[],
        meetings: dayMeetings as any[],
      }),
    };
  });

  return weekAgenda;
}

/**
 * Get agenda for a month
 * Returns an array of days in the month with grouped items
 */
export async function getAgendaForMonth(
  userId: string,
  year: number,
  month: number
): Promise<WeekAgendaDay[]> {
  await dbConnect();

  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12.');
  }

  // Calculate start and end of month
  const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  // Generate all days in the month
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days: Date[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(Date.UTC(year, month - 1, d, 0, 0, 0, 0)));
  }

  // Query once for all items in the month
  const [allTasks, allNotes, regularMeetings, recurringBases] = await Promise.all([
    Task.find({
      userId,
      dueDate: { $gte: startOfMonth, $lte: endOfMonth },
    }).lean(),
    Note.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).lean(),
    Meeting.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      isRecurringBase: { $ne: true },
    }).lean(),
    Meeting.find({
      userId,
      isRecurringBase: true,
    }).lean(),
  ]);

  // Expand recurring meetings for entire month
  const virtualMeetings = recurringBases.flatMap((m) =>
    expandInRange(m, startOfMonth, endOfMonth)
  );

  const allMeetings = [...regularMeetings, ...virtualMeetings];

  // Group by day
  const monthAgenda: WeekAgendaDay[] = days.map((d) => {
    const dayStart = new Date(d);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(d);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const dayTasks = allTasks.filter(
      (t) => t.dueDate && t.dueDate >= dayStart && t.dueDate <= dayEnd
    );
    const dayNotes = allNotes.filter(
      (n) => n.date && n.date >= dayStart && n.date <= dayEnd
    );
    const dayMeetings = allMeetings.filter(
      (m) => {
        const mDate = typeof m.date === 'string' ? new Date(m.date) : m.date;
        return mDate >= dayStart && mDate <= dayEnd;
      }
    );

    const dayLabel = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return {
      date: d,
      label: dayLabel,
      agenda: sortAgenda({
        tasks: dayTasks as any[],
        notes: dayNotes as any[],
        meetings: dayMeetings as any[],
      }),
    };
  });

  return monthAgenda;
}
