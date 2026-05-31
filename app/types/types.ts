/**
 * Shared TypeScript types for the application
 * TODO: Extend with complete type definitions
 */

// User types
export interface User {
  _id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Task types
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  dueDate?: string;
  userId: string;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Note types
export interface Note {
  _id: string;
  title: string;
  content: string;
  date?: string;
  userId: string;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Meeting types
export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  userId: string;
  teamId?: string;
  rrule?: string;
  recurringId?: string;
  isRecurringBase?: boolean;
  isRecurringInstance?: boolean;
  exceptedDates?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Message types
export interface Message {
  _id: string;
  text: string;
  senderName: string;
  senderId: string;
  teamId: string;
  linkedItemId?: string;
  linkedItemType?: 'task' | 'note' | 'meeting';
  createdAt: Date;
}

// Agenda types
export interface AgendaData {
  meetings: Meeting[];
  tasks: Task[];
  notes: Note[];
}

// Search types
export interface SearchResult {
  _id: string;
  title?: string;
  text?: string;
  type: 'task' | 'note' | 'meeting' | 'message';
  score?: number;
  snippet?: string;
}

export interface SearchResults {
  tasks?: SearchResult[];
  notes?: SearchResult[];
  meetings?: SearchResult[];
  messages?: SearchResult[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Recurrence types
export type RecurrenceFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type RecurringEditScope = 'this' | 'following' | 'all';

// Invite types
export interface Invite {
  _id: string;
  token: string;
  email: string;
  teamId: string;
  expiresAt: Date;
  accepted: boolean;
  createdAt: Date;
}

// Team types
export interface Team {
  _id: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Team Member types
export interface TeamMember {
  _id: string;
  userId: string;
  teamId: string;
  role: 'owner' | 'member';
  createdAt: Date;
}
