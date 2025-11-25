import { useState, useEffect } from 'react';
import { NoteServices } from '../services/NoteServices';

export interface Note {
  _id: string;
  title: string;
  content: string;
  pinned: boolean;
  userId: string;
  createdAt: Date;
}

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const notesData = await NoteServices.getAllNotes();
      const formattedNotes = notesData.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt)
      }));
      setNotes(formattedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  // Create a new note
  const createNote = async (noteData: { title: string; content?: string; pinned?: boolean }) => {
    try {
      const newNote = await NoteServices.createNote(noteData);
      const formattedNote = {
        ...newNote,
        createdAt: new Date(newNote.createdAt)
      };
      setNotes(prev => [formattedNote, ...prev]);
      return formattedNote;
    } catch (error) {
      console.error('Error creating note:', error);
      setError(error instanceof Error ? error.message : 'Failed to create note');
      throw error;
    }
  };

  // Update an existing note
  const updateNote = async (noteId: string, updates: Partial<{ title: string; content: string; pinned: boolean }>) => {
    try {
      const updatedNote = await NoteServices.updateNote(noteId, updates);
      const formattedNote = {
        ...updatedNote,
        createdAt: new Date(updatedNote.createdAt)
      };
      setNotes(prev => prev.map(note => 
        note._id === noteId ? formattedNote : note
      ));
      return formattedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      setError(error instanceof Error ? error.message : 'Failed to update note');
      throw error;
    }
  };

  // Delete a note
  const deleteNote = async (noteId: string) => {
    try {
      await NoteServices.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete note');
      throw error;
    }
  };

  // Pin/unpin a note
  const togglePin = async (noteId: string) => {
    const note = notes.find(n => n._id === noteId);
    if (note) {
      await updateNote(noteId, { pinned: !note.pinned });
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
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    refetch: fetchNotes
  };
};