import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/middleware';
import { getNoteById, updateNote, deleteNote, NoteData } from '@/lib/services/noteService';

/**
 * GET /api/notes/[id]
 * Fetch a single note by ID
 * Verifies ownership before returning
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, userId: string) => {
    try {
      const noteId = params.id;

      if (!noteId) {
        return errorResponse('Note ID is required', 400);
      }

      const note = await getNoteById(noteId, userId);
      if (!note) {
        return errorResponse('Note not found', 404);
      }

      return successResponse(note, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch note';
      return errorResponse(message, 500);
    }
  });
}

/**
 * PATCH /api/notes/[id]
 * Update a note
 * Verifies ownership before updating
 * Body: Partial note fields to update (title, content, pinned, date, linkedTaskId, linkedMeetingId, tags, linkedMessageId)
 * Returns: updated note object
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, userId: string) => {
    try {
      const noteId = params.id;
      const body = await request.json();

      if (!noteId) {
        return errorResponse('Note ID is required', 400);
      }

      const updatedData: Partial<NoteData> = {};

      // Validate and set title if provided
      if (body.title !== undefined) {
        if (typeof body.title !== 'string' || body.title.trim() === '') {
          return errorResponse('Note title must be a non-empty string', 400);
        }
        updatedData.title = body.title.trim();
      }

      // Set other optional fields
      if (body.content !== undefined) {
        updatedData.content = body.content;
      }

      if (body.pinned !== undefined) {
        updatedData.pinned = body.pinned;
      }

      if (body.date !== undefined) {
        updatedData.date = body.date;
      }

      if (body.linkedTaskId !== undefined) {
        updatedData.linkedTaskId = body.linkedTaskId;
      }

      if (body.linkedMeetingId !== undefined) {
        updatedData.linkedMeetingId = body.linkedMeetingId;
      }

      if (body.linkedMessageId !== undefined) {
        updatedData.linkedMessageId = body.linkedMessageId;
      }

      if (body.tags !== undefined) {
        updatedData.tags = body.tags;
      }

      const editedNote = await updateNote(noteId, userId, updatedData);
      return successResponse(editedNote, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update note';
      // Return 404 if note not found, 500 for other errors
      const status = message.includes('not found') ? 404 : 500;
      return errorResponse(message, status);
    }
  });
}

/**
 * DELETE /api/notes/[id]
 * Delete a note by ID
 * Verifies ownership before deleting
 * Returns: success message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, userId: string) => {
    try {
      const noteId = params.id;

      if (!noteId) {
        return errorResponse('Note ID is required', 400);
      }

      const deleted = await deleteNote(noteId, userId);
      if (!deleted) {
        return errorResponse('Note not found', 404);
      }

      return successResponse(
        { message: 'Note deleted successfully', _id: noteId },
        200
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete note';
      // Return 404 if note not found, 500 for other errors
      const status = message.includes('not found') ? 404 : 500;
      return errorResponse(message, status);
    }
  });
}
