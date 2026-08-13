import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthenticatedUser, respondUnauthorized } from '@/lib/auth';
import { getMeetings, createMeeting } from '@/models/MeetingAccessDataService';

// GET /api/meetings
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const meetings = await getMeetings(user.id);
    return NextResponse.json(meetings, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/meetings
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const body = await request.json();
    const { title, description, date, startTime, endTime, rrule } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Meeting title is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Meeting date is required.' },
        { status: 400 }
      );
    }

    const meetingData = {
      title: title.trim(),
      description: description || '',
      date,
      userId: user.id,
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(rrule && { rrule, isRecurringBase: true }),
    };

    const newMeeting = await createMeeting(meetingData);
    return NextResponse.json(newMeeting, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
