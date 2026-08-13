import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthenticatedUser, respondUnauthorized } from '@/lib/auth';
import Meeting from '@/models/mongoDB/Meeting';
import { extractRrulePart, buildRrule } from '@/utils/rruleExpander';
import { v4 as uuidv4 } from 'uuid';

// PATCH /api/meetings/[id]/recurring
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const body = await request.json();
    const { scope, action, date, data } = body;

    if (!scope || !action || !date) {
      return NextResponse.json(
        { error: 'scope, action, and date are required' },
        { status: 400 }
      );
    }

    const base = await Meeting.findOne({ _id: params.id, userId: user.id });
    if (!base) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const occurrenceDate = new Date(date + 'T00:00:00.000Z');

    // scope: 'this'
    if (scope === 'this') {
      if (!base.exceptedDates.includes(date)) {
        base.exceptedDates.push(date);
        await base.save();
      }

      if (action === 'edit') {
        const exception = await Meeting.create({
          _id: uuidv4(),
          userId: user.id,
          title: (data?.title || base.title).trim(),
          description: data?.description ?? base.description,
          date: occurrenceDate,
          startTime: data?.startTime ?? base.startTime,
          endTime: data?.endTime ?? base.endTime,
          recurringId: base._id,
          isRecurringBase: false,
        });
        return NextResponse.json({ exception, base }, { status: 201 });
      }
      return NextResponse.json({ base }, { status: 200 });
    }

    // scope: 'following'
    if (scope === 'following') {
      const dayBefore = new Date(occurrenceDate.getTime() - 24 * 60 * 60 * 1000);
      const untilStr = dayBefore.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const rrulePart = base.rrule || '';
      const stripped = rrulePart.replace(/;?UNTIL=[^;\n\r]+/g, '');

      if (stripped.includes('RRULE:')) {
        base.rrule = stripped.replace(/^(RRULE:[^\n]*)/, `$1;UNTIL=${untilStr}`);
      } else if (stripped) {
        base.rrule = stripped + `;UNTIL=${untilStr}`;
      }
      await base.save();

      if (action === 'edit') {
        const baseFreq = extractRrulePart(base.rrule);
        const newFreq = data?.rruleFreq || baseFreq;
        const newRrule = buildRrule(newFreq, occurrenceDate);

        const newBase = await Meeting.create({
          _id: uuidv4(),
          userId: user.id,
          title: (data?.title || base.title).trim(),
          description: data?.description ?? base.description,
          date: occurrenceDate,
          startTime: data?.startTime ?? base.startTime,
          endTime: data?.endTime ?? base.endTime,
          rrule: newRrule,
          isRecurringBase: true,
          recurringId: base._id,
        });
        return NextResponse.json({ truncated: base, newBase }, { status: 201 });
      }
      return NextResponse.json({ truncated: base }, { status: 200 });
    }

    return NextResponse.json(
      { error: 'scope must be "this" or "following"' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
