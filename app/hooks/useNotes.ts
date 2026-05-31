import { useState, useEffect } from 'react';

export interface Note {
  _id: string;
  title: string;
  content: string;
  pinned: boolean;
  userId: string;
  createdAt: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getAllNotes = async (): Promise<Note[]> => {
  const response = await fetch(`${API_URL}/api/notes`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch notes');
  const notes = await response.json();
  return notes.map((note: any) => ({
    ...note,
    createdAt: new Date(note.createdAt),
  }));
};

const createNote = async (noteData: {
  title: string;
  content?: string;
  pinned?: boolean;
}): Promise<Note> => {
  const response = await fetch(`${API_URL}/api/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(noteData),
  });
  if (!response.ok) throw new Error('Failed to create note');
  const note = await response.json();
  return { ...note, createdAt: new Date(note.createdAt) };
};

const updateNote = async (
  noteId: string,
  updates: Partial<{ title: string; content: string; pinned: boolean }>
): Promise<Note> => {
  const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update note');
  const note = await response.json();
  return { ...note, createdAt: new Date(note.createdAt) };
};

const deleteNote = async (noteId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete note');
};

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const notesData = await getAllNotes();
      setNotes(notesData);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  // Create a new note
  const createNoteHandler = async (noteData: {
    title: string;
    content?: string;
    pinned?: boolean;
  }) => {
    try {
      const newNote = await createNote(noteData);
      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      setError(err instanceof Error ? err.message : 'Failed to create note');
      throw err;
    }
  };

  // Update an existing note
  const updateNoteHandler = async (
    noteId: string,
    updates: Partial<{ title: string; content: string; pinned: boolean }>
  ) => {
    try {
      const updatedNote = await updateNote(noteId, updates);
      setNotes((prev) =>
        prev.map((note) => (note._id === noteId ? updatedNote : note))
      );
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    }
  };

  // Delete a note
  const deleteNoteHandler = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    }
  };

  // Pin/unpin a note
  const togglePin = async (noteId: string) => {
    const note = notes.find((n) => n._id === noteId);
    if (note) {
      await updateNoteHandler(noteId, { pinned: !note.pinned });
    }
  };

  // Load notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    loading,
    error,
    createNote: createNoteHandler,
    updateNote: updateNoteHandler,
    deleteNote: deleteNoteHandler,
    togglePin,
    refetch: fetchNotes,
  };
};
