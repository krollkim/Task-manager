import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Task,
  Note,
  Meeting,
  AgendaData,
  AgendaView,
  WeekAgendaDay,
} from '../types/types';

interface AppStore {
  // TASK SLICE
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  upsertTask: (task: Task) => void;
  removeTask: (id: string) => void;

  // NOTE SLICE
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  upsertNote: (note: Note) => void;
  removeNote: (id: string) => void;

  // AGENDA SLICE
  agendaCache: Record<string, AgendaData>;
  monthCache: Record<string, WeekAgendaDay[]>;
  setDayAgenda: (dateKey: string, data: AgendaData) => void;
  setMonthAgenda: (monthKey: string, data: WeekAgendaDay[]) => void;
  invalidateAgenda: () => void;

  // UI SLICE (partially persisted to localStorage)
  selectedDate: Date;
  agendaView: AgendaView;
  searchQuery: string;
  searchResults: null | { tasks: Task[]; notes: Note[]; meetings: Meeting[] };
  searchLoading: boolean;
  setSelectedDate: (d: Date) => void;
  setAgendaView: (v: AgendaView) => void;
  setSearchQuery: (q: string) => void;
  setSearchResults: (r: AppStore['searchResults']) => void;
  setSearchLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // TASK SLICE
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      upsertTask: (task) =>
        set((state) => ({
          tasks: state.tasks.some((t) => t._id === task._id)
            ? state.tasks.map((t) => (t._id === task._id ? task : t))
            : [...state.tasks, task],
        })),
      removeTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) })),

      // NOTE SLICE
      notes: [],
      setNotes: (notes) => set({ notes }),
      upsertNote: (note) =>
        set((state) => ({
          notes: state.notes.some((n) => n._id === note._id)
            ? state.notes.map((n) => (n._id === note._id ? note : n))
            : [...state.notes, note],
        })),
      removeNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n._id !== id) })),

      // AGENDA SLICE
      agendaCache: {},
      monthCache: {},
      setDayAgenda: (dateKey, data) =>
        set((state) => ({
          agendaCache: { ...state.agendaCache, [dateKey]: data },
        })),
      setMonthAgenda: (monthKey, data) =>
        set((state) => ({
          monthCache: { ...state.monthCache, [monthKey]: data },
        })),
      invalidateAgenda: () => set({ agendaCache: {}, monthCache: {} }),

      // UI SLICE
      selectedDate: new Date(),
      agendaView: 'day',
      searchQuery: '',
      searchResults: null,
      searchLoading: false,
      setSelectedDate: (d) => set({ selectedDate: d }),
      setAgendaView: (v) => set({ agendaView: v }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSearchResults: (r) => set({ searchResults: r }),
      setSearchLoading: (loading) => set({ searchLoading: loading }),
    }),
    {
      name: 'app-ui-prefs',
      partialize: (state) => ({ agendaView: state.agendaView }),
    }
  )
);
