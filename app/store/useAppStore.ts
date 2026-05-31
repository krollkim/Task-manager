'use client';

import { create } from 'zustand';
import { Task, Note, Meeting, Message, SearchResults, AgendaData } from '@/types/types';

/**
 * Zustand store for application state
 * TODO: Implement full store with all slices
 * Reference: Phase 0 from feature/architecture-v2
 *
 * Slices:
 * 1. Tasks - CRUD operations for tasks
 * 2. Notes - CRUD operations for notes
 * 3. Agenda - Day/week/month agenda views
 * 4. UI - Global UI state (modals, search, etc.)
 */

interface TaskSlice {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

interface NoteSlice {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

interface AgendaSlice {
  meetings: Meeting[];
  setMeetings: (meetings: Meeting[]) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
}

interface UISlice {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResults | null;
  setSearchResults: (results: SearchResults | null) => void;
  searchLoading: boolean;
  setSearchLoading: (loading: boolean) => void;
  // Modal state
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

type AppStore = TaskSlice & NoteSlice & AgendaSlice & UISlice;

export const useAppStore = create<AppStore>((set) => ({
  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  updateTask: (id, task) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === id ? { ...t, ...task } : t
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== id),
    })),

  // Notes
  notes: [],
  setNotes: (notes) => set({ notes }),
  addNote: (note) =>
    set((state) => ({
      notes: [...state.notes, note],
    })),
  updateNote: (id, note) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n._id === id ? { ...n, ...note } : n
      ),
    })),
  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n._id !== id),
    })),

  // Meetings
  meetings: [],
  setMeetings: (meetings) => set({ meetings }),
  addMeeting: (meeting) =>
    set((state) => ({
      meetings: [...state.meetings, meeting],
    })),
  updateMeeting: (id, meeting) =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m._id === id ? { ...m, ...meeting } : m
      ),
    })),
  deleteMeeting: (id) =>
    set((state) => ({
      meetings: state.meetings.filter((m) => m._id !== id),
    })),

  // UI
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  searchResults: null,
  setSearchResults: (results) => set({ searchResults: results }),
  searchLoading: false,
  setSearchLoading: (loading) => set({ searchLoading: loading }),
  isModalOpen: false,
  setIsModalOpen: (open) => set({ isModalOpen: open }),
}));
