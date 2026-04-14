import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

export const NoteServices = {
  // Get all notes
  getAllNotes: async () => {
    try {
      const { data } = await api.get('/notes');
      return data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw new Error(error.response?.data?.message || 'Error fetching notes');
    }
  },

  // Create a new note
  createNote: async (noteData) => {
    try {
      const { data } = await api.post('/notes', noteData);
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error(error.response?.data?.message || 'Error creating note');
    }
  },

  // Update an existing note
  updateNote: async (noteId, noteData) => {
    try {
      const { data } = await api.patch(`/notes/${noteId}`, noteData);
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error(error.response?.data?.message || 'Error updating note');
    }
  },

  // Delete a note
  deleteNote: async (noteId) => {
    try {
      const { data } = await api.delete(`/notes/${noteId}`);
      return data;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error(error.response?.data?.message || 'Error deleting note');
    }
  },

  // Get a specific note
  getNote: async (noteId) => {
    try {
      const { data } = await api.get(`/notes/${noteId}`);
      return data;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw new Error(error.response?.data?.message || 'Error fetching note');
    }
  },
};
