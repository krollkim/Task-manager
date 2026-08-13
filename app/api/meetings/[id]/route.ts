import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthenticatedUser, respondUnauthorized } from '@/lib/auth';
import { getMeeting, editMeeting, deleteMeeting } from '@/models/MeetingAccessDataService';

// GET /api/meetings/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const meeting = await getMeeting(params.id, user.id);
    return NextResponse.json(meeting, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/meetings/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const updatedData = await request.json();
    const editedMeeting = await editMeeting(params.id, updatedData, user.id);

    return NextResponse.json(editedMeeting, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/meetings/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    if (!params.id) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    const deletedMeeting = await deleteMeeting(params.id, user.id);
    return NextResponse.json(
      {
        message: 'Meeting deleted successfully',
        meeting: deletedMeeting,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
