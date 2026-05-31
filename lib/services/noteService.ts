import dbConnect from '../db';

export interface NoteData {
  _id?: string;
  title: string;
  content?: string;
  pinned?: boolean;
  date?: string | Date;
  userId: string;
  createdAt?: string | Date;
  linkedTaskId?: string | null;
  linkedMeetingId?: string | null;
  tags?: string[];
  linkedMessageId?: string | null;
}

export interface NoteResponse {
  _id: string;
  title: string;
  content: string;
  pinned: boolean;
  date?: string | Date;
  userId: string;
  createdAt: string | Date;
  linkedTaskId?: string | null;
  linkedMeetingId?: string | null;
  tags?: string[];
  linkedMessageId?: string | null;
}

/**
 * Get all notes for a user, sorted by createdAt descending (newest first)
 */
export async function getAllNotes(userId: string): Promise<NoteResponse[]> {
  try {
    await dbConnect();

    // Dynamically import to avoid circular dependency issues
    const { default: Note } = await import('../../server/models/mongoDB/Note.js');
    const notes = await Note.find({ userId }).sort({ createdAt: -1 }).lean();
    return notes as NoteResponse[];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch notes';
    throw new Error(`Error fetching notes: ${message}`);
  }
}

/**
 * Get a single note by ID
 * Verifies ownership before returning
 */
export async function getNoteById(
  noteId: string,
  userId: string
): Promise<NoteResponse | null> {
  try {
    await dbConnect();

    const { default: Note } = await import('../../server/models/mongoDB/Note.js');
    const note = await Note.findOne({ _id: noteId, userId }).lean();
    if (!note) {
      return null;
    }
    return note as NoteResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch note';
    throw new Error(`Error fetching note: ${message}`);
  }
}

/**
 * Create a new note
 */
export async function createNote(
  userId: string,
  data: Omit<NoteData, 'userId' | '_id'>
): Promise<NoteResponse> {
  try {
    // Validate required fields
    if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
      throw new Error('Note title is required and must be a non-empty string');
    }

    await dbConnect();

    const { default: Note } = await import('../../server/models/mongoDB/Note.js');

    const noteData: NoteData = {
      title: data.title.trim(),
      content: data.content || '',
      pinned: data.pinned ?? false,
      userId,
      ...(data.date && { date: data.date }),
      ...(data.linkedTaskId && { linkedTaskId: data.linkedTaskId }),
      ...(data.linkedMeetingId && { linkedMeetingId: data.linkedMeetingId }),
      ...(data.tags && { tags: data.tags }),
      ...(data.linkedMessageId && { linkedMessageId: data.linkedMessageId }),
    };

    const newNote = await Note.create(noteData);
    return newNote.toObject() as NoteResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create note';
    throw new Error(`Error creating note: ${message}`);
  }
}

/**
 * Update a note
 * Verifies ownership before updating
 */
export async function updateNote(
  noteId: string,
  userId: string,
  data: Partial<NoteData>
): Promise<NoteResponse> {
  try {
    await dbConnect();

    const { default: Note } = await import('../../server/models/mongoDB/Note.js');

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      throw new Error('Note not found');
    }

    // Update fields
    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || data.title.trim() === '') {
        throw new Error('Note title must be a non-empty string');
      }
      note.title = data.title.trim();
    }

    if (data.content !== undefined) {
      note.content = data.content;
    }

    if (data.pinned !== undefined) {
      note.pinned = data.pinned;
    }

    if (data.date !== undefined) {
      note.date = data.date;
    }

    if (data.linkedTaskId !== undefined) {
      note.linkedTaskId = data.linkedTaskId;
    }

    if (data.linkedMeetingId !== undefined) {
      note.linkedMeetingId = data.linkedMeetingId;
    }

    if (data.linkedMessageId !== undefined) {
      note.linkedMessageId = data.linkedMessageId;
    }

    if (data.tags !== undefined) {
      note.tags = data.tags;
    }

    await note.save();
    return note.toObject() as NoteResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update note';
    throw new Error(`Error updating note: ${message}`);
  }
}

/**
 * Delete a note
 * Verifies ownership before deleting
 */
export async function deleteNote(noteId: string, userId: string): Promise<boolean> {
  try {
    await dbConnect();

    const { default: Note } = await import('../../server/models/mongoDB/Note.js');

    const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId });
    if (!deletedNote) {
      throw new Error('Note not found');
    }

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete note';
    throw new Error(`Error deleting note: ${message}`);
  }
}
