import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthenticatedUser, respondUnauthorized } from '@/lib/auth';
import { getNotes, createNote } from '@/models/NoteAccessDataService';

// GET /api/notes
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const notes = await getNotes(user.id);
    return NextResponse.json(notes, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/notes
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const body = await request.json();
    const { title, content, pinned, date } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Note title is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    const noteData = {
      title: title.trim(),
      content: content || '',
      pinned: pinned || false,
      userId: user.id,
      ...(date && { date }),
    };

    const newNote = await createNote(noteData);
    return NextResponse.json(newNote, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
