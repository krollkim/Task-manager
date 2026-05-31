/**
 * Unified API Client Layer
 *
 * Comprehensive axios-based client for all API endpoints.
 * Organized into namespaces: auth, tasks, meetings, notes, agenda, search, teams.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  User,
  Task,
  Meeting,
  Note,
  Message,
  AgendaData,
  SearchResults,
  SearchResult,
} from '@/types/types';

/**
 * Base API Client Configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Error Handler Utility
 *
 * Safely extracts error message from Axios errors or unknown errors.
 */
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || 'Request failed';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Register a new user
   * POST /auth/register
   */
  register: async (data: { name: string; email: string; password: string }) => {
    return apiClient.post<{ user: User }>('/auth/register', data);
  },

  /**
   * Login with email and password
   * POST /auth/login
   */
  login: async (data: { email: string; password: string }) => {
    return apiClient.post<{ user: User }>('/auth/login', data);
  },

  /**
   * Logout and clear session
   * POST /auth/logout
   */
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Validate current session
   * GET /auth/me
   */
  getMe: async () => {
    return apiClient.get<{ user: User }>('/auth/me');
  },
};

/**
 * Tasks API
 */
export const tasksApi = {
  /**
   * Get all tasks for the current user
   * GET /tasks
   */
  getAll: async () => {
    return apiClient.get<Task[]>('/tasks');
  },

  /**
   * Get a single task by ID
   * GET /tasks/:id
   */
  getOne: async (id: string) => {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  /**
   * Create a new task
   * POST /tasks
   */
  create: async (data: Partial<Task>) => {
    return apiClient.post<Task>('/tasks', data);
  },

  /**
   * Update a task
   * PATCH /tasks/:id
   */
  update: async (id: string, data: Partial<Task>) => {
    return apiClient.patch<Task>(`/tasks/${id}`, data);
  },

  /**
   * Delete a task
   * DELETE /tasks/:id
   */
  delete: async (id: string) => {
    return apiClient.delete(`/tasks/${id}`);
  },

  /**
   * Quick reschedule a task (+1 day or +7 days)
   * PATCH /tasks/:id with { dueDate }
   */
  quickReschedule: async (id: string, dueDate: string) => {
    return apiClient.patch<Task>(`/tasks/${id}`, { dueDate });
  },
};

/**
 * Meetings API
 */
export const meetingsApi = {
  /**
   * Get all meetings for the current user
   * GET /meetings
   */
  getAll: async () => {
    return apiClient.get<Meeting[]>('/meetings');
  },

  /**
   * Get a single meeting by ID
   * GET /meetings/:id
   */
  getOne: async (id: string) => {
    return apiClient.get<Meeting>(`/meetings/${id}`);
  },

  /**
   * Create a new meeting
   * POST /meetings
   * Accepts optional rrule for recurring meetings
   */
  create: async (data: Partial<Meeting>) => {
    return apiClient.post<Meeting>('/meetings', data);
  },

  /**
   * Update a single meeting
   * PATCH /meetings/:id
   */
  update: async (id: string, data: Partial<Meeting>) => {
    return apiClient.patch<Meeting>(`/meetings/${id}`, data);
  },

  /**
   * Update a recurring meeting with scope control
   * PATCH /meetings/:id/recurring
   *
   * Scope options:
   * - 'this': Edit only this occurrence
   * - 'following': Edit this and all following occurrences
   * - 'all': Edit all occurrences in the series
   *
   * Action options:
   * - 'edit': Modify meeting details
   * - 'delete': Remove meeting(s)
   */
  updateRecurring: async (
    id: string,
    data: {
      scope: 'this' | 'following' | 'all';
      action: 'edit' | 'delete';
      date?: string;
      updates?: Partial<Meeting>;
    }
  ) => {
    return apiClient.patch<Meeting>(`/meetings/${id}/recurring`, data);
  },

  /**
   * Delete a meeting
   * DELETE /meetings/:id
   */
  delete: async (id: string) => {
    return apiClient.delete(`/meetings/${id}`);
  },

  /**
   * Quick reschedule a meeting (+1 day or +7 days)
   * PATCH /meetings/:id with { date }
   */
  quickReschedule: async (id: string, date: string) => {
    return apiClient.patch<Meeting>(`/meetings/${id}`, { date });
  },
};

/**
 * Notes API
 */
export const notesApi = {
  /**
   * Get all notes for the current user
   * GET /notes
   */
  getAll: async () => {
    return apiClient.get<Note[]>('/notes');
  },

  /**
   * Get a single note by ID
   * GET /notes/:id
   */
  getOne: async (id: string) => {
    return apiClient.get<Note>(`/notes/${id}`);
  },

  /**
   * Create a new note
   * POST /notes
   */
  create: async (data: Partial<Note>) => {
    return apiClient.post<Note>('/notes', data);
  },

  /**
   * Update a note
   * PATCH /notes/:id
   */
  update: async (id: string, data: Partial<Note>) => {
    return apiClient.patch<Note>(`/notes/${id}`, data);
  },

  /**
   * Delete a note
   * DELETE /notes/:id
   */
  delete: async (id: string) => {
    return apiClient.delete(`/notes/${id}`);
  },
};

/**
 * Agenda API
 *
 * Fetches grouped agenda data (tasks, notes, meetings) for specific date ranges.
 */
export const agendaApi = {
  /**
   * Get agenda for a single day
   * GET /agenda?date=YYYY-MM-DD
   */
  getDay: async (date: string) => {
    return apiClient.get<AgendaData>('/agenda', { params: { date } });
  },

  /**
   * Get agenda for a full month
   * GET /agenda/month?year=YYYY&month=M (month is 1-based)
   */
  getMonth: async (year: number, month: number) => {
    return apiClient.get<{
      [key: string]: AgendaData;
    }>('/agenda/month', { params: { year, month } });
  },

  /**
   * Get agenda for a week (caller orchestrates 7 parallel day calls)
   *
   * Convenience helper that fetches all 7 days and returns organized by date.
   */
  getWeek: async (startDate: string) => {
    const start = new Date(startDate);
    const daysData: { [key: string]: AgendaData } = {};

    // Fetch all 7 days in parallel
    const promises = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      promises.push(
        agendaApi.getDay(dateStr).then((res) => {
          daysData[dateStr] = res.data;
        })
      );
    }

    await Promise.all(promises);
    return { data: daysData };
  },
};

/**
 * Search API
 *
 * Global full-text search across tasks, notes, meetings, and messages.
 */
export const searchApi = {
  /**
   * Perform global search
   * GET /search?q=<query>&types=tasks,notes,meetings,messages&limit=20
   *
   * Parameters:
   * - q: Search query (min 2 chars)
   * - types: Comma-separated list of types to search (tasks, notes, meetings, messages)
   * - limit: Max results per type (1-50, default 20)
   */
  search: async (
    query: string,
    options?: {
      types?: ('tasks' | 'notes' | 'meetings' | 'messages')[];
      limit?: number;
    }
  ) => {
    const params: any = { q: query };

    if (options?.types && options.types.length > 0) {
      params.types = options.types.join(',');
    }

    if (options?.limit) {
      params.limit = Math.min(options.limit, 50);
    }

    return apiClient.get<SearchResults>('/search', { params });
  },
};

/**
 * Teams API
 *
 * Workspace management, invitations, and team membership.
 */
export const teamsApi = {
  /**
   * Get all teams/workspaces for the current user
   * GET /teams
   */
  getAll: async () => {
    return apiClient.get('/teams');
  },

  /**
   * Create an invite link for a new team member
   * POST /teams/invite
   *
   * Returns invite details and shareable invite URL.
   */
  createInvite: async (email: string) => {
    return apiClient.post<{
      invite: {
        _id: string;
        email: string;
        token: string;
        invitedBy: string;
        status: string;
        expiresAt: string;
      };
      inviteUrl: string;
    }>('/teams/invite', { email });
  },

  /**
   * Validate an invite token (public endpoint)
   * GET /teams/invite/:token
   *
   * Used on /join/:token page to check if invite is still valid.
   */
  validateInvite: async (token: string) => {
    return apiClient.get<{
      email: string;
      workspaceId?: string;
    }>(`/teams/invite/${token}`);
  },

  /**
   * Accept an invite (logged-in user)
   * POST /teams/invite/:token/accept
   *
   * Marks invite as accepted and creates TeamMember record.
   */
  acceptInvite: async (token: string) => {
    return apiClient.post<{
      success: boolean;
      workspaceId?: string;
    }>(`/teams/invite/${token}/accept`);
  },

  /**
   * Get team members
   * GET /teams/:teamId/members
   */
  getMembers: async (teamId: string) => {
    return apiClient.get(`/teams/${teamId}/members`);
  },
};

/**
 * Export API client for direct use if needed
 */
export { apiClient };

/**
 * Export error handler for use in components/hooks
 */
export { getErrorMessage };
