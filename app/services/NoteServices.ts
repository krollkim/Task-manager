const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const NoteServices = {
  async getAllNotes() {
    const response = await fetch(`${API_URL}/api/notes`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch notes');
    return response.json();
  },

  async createNote(noteData: {
    title: string;
    content?: string;
    pinned?: boolean;
    date?: string;
  }) {
    const response = await fetch(`${API_URL}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error('Failed to create note');
    return response.json();
  },

  async updateNote(
    noteId: string,
    updates: Partial<{
      title: string;
      content: string;
      pinned: boolean;
      date: string;
    }>
  ) {
    const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update note');
    return response.json();
  },

  async deleteNote(noteId: string) {
    const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete note');
    return response.json();
  },
};
