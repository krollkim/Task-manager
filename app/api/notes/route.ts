import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/middleware';
import { getAllNotes, createNote, NoteData } from '@/lib/services/noteService';

/**
 * GET /api/notes
 * Fetch all notes for the authenticated user
 * Query params: none
 * Returns: array of notes sorted by createdAt descending (newest first)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, userId: string) => {
    try {
      const notes = await getAllNotes(userId);
      return successResponse(notes, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch notes';
      return errorResponse(message, 500);
    }
  });
}

/**
 * POST /api/notes
 * Create a new note
 * Body: { title, content?, pinned?, date?, linkedTaskId?, linkedMeetingId?, tags?, linkedMessageId? }
 * Returns: created note object
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, userId: string) => {
    try {
      const body = await request.json();

      // Validate required fields
      if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
        return errorResponse(
          'Note title is required and must be a non-empty string',
          400
        );
      }

      const noteData: Omit<NoteData, 'userId' | '_id'> = {
        title: body.title.trim(),
        content: body.content || '',
        pinned: body.pinned ?? false,
        ...(body.date && { date: body.date }),
        ...(body.linkedTaskId && { linkedTaskId: body.linkedTaskId }),
        ...(body.linkedMeetingId && { linkedMeetingId: body.linkedMeetingId }),
        ...(body.tags && { tags: body.tags }),
        ...(body.linkedMessageId && { linkedMessageId: body.linkedMessageId }),
      };

      const newNote = await createNote(userId, noteData);
      return successResponse(newNote, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create note';
      return errorResponse(message, 500);
    }
  });
}
