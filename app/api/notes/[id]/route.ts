import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthenticatedUser, respondUnauthorized } from '@/lib/auth';
import { getNote, editNote, deleteNote } from '@/models/NoteAccessDataService';

// GET /api/notes/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const note = await getNote(params.id, user.id);
    return NextResponse.json(note, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/notes/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const updatedData = await request.json();
    const editedNote = await editNote(params.id, updatedData, user.id);

    return NextResponse.json(editedNote, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/notes/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    if (!params.id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    const deletedNote = await deleteNote(params.id, user.id);
    return NextResponse.json(
      {
        message: 'Note deleted successfully',
        note: deletedNote,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
