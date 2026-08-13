import Task from '@/models/mongoDB/Task';
import Note from '@/models/mongoDB/Note';
import Meeting from '@/models/mongoDB/Meeting';
import { expandInRange, toDateStr } from '@/utils/rruleExpander';

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function sortAgenda(tasks: any[], notes: any[], meetings: any[]) {
  const sortedMeetings = [...meetings].sort((a, b) => {
    const aHas = !!a.startTime;
    const bHas = !!b.startTime;
    if (!aHas && !bHas) return 0;
    if (!aHas) return 1;
    if (!bHas) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  const sortedTasks = [...tasks].sort((a, b) => {
    const aPri = a.priority ? (PRIORITY_ORDER[a.priority] ?? 4) : 4;
    const bPri = b.priority ? (PRIORITY_ORDER[b.priority] ?? 4) : 4;
    return aPri - bPri;
  });

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { meetings: sortedMeetings, tasks: sortedTasks, notes: sortedNotes };
}

export async function getAgendaForDay(userId: string, date: string) {
  const startOfDay = new Date(date + 'T00:00:00.000Z');
  const endOfDay = new Date(date + 'T23:59:59.999Z');

  const [tasks, notes, baseMeetings] = await Promise.all([
    Task.find({
      userId,
      $or: [
        { dueDate: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } },
      ],
    }),
    Note.find({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }),
    Meeting.find({
      userId,
      $or: [
        { date: { $gte: startOfDay, $lte: endOfDay } },
        { isRecurringBase: true },
      ],
    }),
  ]);

  // Expand recurring meetings
  let meetings = baseMeetings.filter((m: any) => !m.isRecurringBase);
  for (const base of baseMeetings.filter((m: any) => m.isRecurringBase)) {
    const expanded = expandInRange(base.toObject ? base.toObject() : base, startOfDay, endOfDay);
    meetings = meetings.concat(expanded);
  }

  const { meetings: sortedMeetings, tasks: sortedTasks, notes: sortedNotes } = sortAgenda(
    tasks,
    notes,
    meetings
  );

  return {
    meetings: sortedMeetings,
    tasks: sortedTasks,
    notes: sortedNotes,
  };
}
