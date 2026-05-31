import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/notes/[id]
 * Fetch a single note by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;

    if (!noteId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Note ID is required',
        },
        { status: 400 }
      );
    }

    // TODO: Check auth (extract user ID from JWT/session)
    // TODO: Fetch note from MongoDB using getNote(noteId, userId)
    // TODO: Verify user owns this note
    // TODO: Return note

    const note = {
      _id: noteId,
      title: 'Stub Note',
      content: 'This is a stub note',
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: note,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch note',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notes/[id]
 * Update a note
 * Body: Partial note fields to update (title, content, pinned, date, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    const updatedData = await request.json();

    if (!noteId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Note ID is required',
        },
        { status: 400 }
      );
    }

    // TODO: Check auth (extract user ID from JWT/session)
    // TODO: Call editNote(noteId, updatedData, userId)
    // TODO: Verify user owns this note
    // TODO: Return updated note

    const editedNote = {
      _id: noteId,
      title: updatedData.title || 'Updated Note',
      content: updatedData.content || '',
      pinned: updatedData.pinned !== undefined ? updatedData.pinned : false,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: editedNote,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update note',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes/[id]
 * Delete a note by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;

    if (!noteId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Note ID is required',
        },
        { status: 400 }
      );
    }

    // TODO: Check auth (extract user ID from JWT/session)
    // TODO: Call deleteNote(noteId, userId)
    // TODO: Verify user owns this note
    // TODO: Return success response

    return NextResponse.json(
      {
        success: true,
        message: 'Note deleted successfully',
        data: {
          _id: noteId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete note',
      },
      { status: 500 }
    );
  }
}
