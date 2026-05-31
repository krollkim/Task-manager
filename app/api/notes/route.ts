import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/notes
 * Fetch all notes for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Check auth (extract user ID from JWT/session)
    // TODO: Fetch notes from MongoDB using getNotes(userId)
    // TODO: Return notes array

    const notes = [
      // Placeholder
    ];

    return NextResponse.json(
      {
        success: true,
        data: notes,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notes',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes
 * Create a new note
 * Body: { title: string, content?: string, pinned?: boolean, date?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Note title is required and must be a non-empty string.',
        },
        { status: 400 }
      );
    }

    // TODO: Check auth (extract user ID from JWT/session)
    // TODO: Call createNote(noteData) with validated data
    // TODO: Return created note

    const noteData = {
      title: body.title.trim(),
      content: body.content || '',
      pinned: body.pinned || false,
      // userId will be set from auth context
      ...(body.date && { date: body.date }),
    };

    const newNote = {
      _id: 'stub-note-id',
      ...noteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newNote,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create note',
      },
      { status: 500 }
    );
  }
}
