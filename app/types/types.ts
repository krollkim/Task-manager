// Component modal modes
export type ModalMode = 'edit' | 'preview';

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
  task?: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  dueDate?: string;
  estimateMinutes?: number;
  spentMinutes?: number;
  userId?: string;
  teamId?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Note types
export interface Note {
  _id: string;
  title: string;
  content: string;
  pinned?: boolean;
  date?: string;
  userId: string;
  teamId?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Meeting types
export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  userId?: string;
  teamId?: string;
  rrule?: string | null;
  recurringId?: string | null;
  isRecurringBase?: boolean;
  isRecurringInstance?: boolean;
  exceptedDates?: string[];
  linkedTaskIds?: string[];
  linkedNoteIds?: string[];
  tags?: string[];
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Message / Chat types
export interface ChatMessage {
  _id: string;
  text: string;
  senderName: string;
  senderId: string;
  roomId: string;
  teamId?: string;
  linkedItemId?: string | null;
  linkedItemType?: 'task' | 'note' | 'meeting' | null;
  createdAt: string | Date;
}

export interface PresenceUser {
  userId: string;
  name: string;
  avatar: string | null;
}

// Agenda types
export interface AgendaData {
  meetings: Meeting[];
  tasks: Task[];
  notes: Note[];
}

export type AgendaView = 'day' | 'week' | 'month';

export interface WeekAgendaDay {
  date: Date;
  label: string;
  agenda: AgendaData;
}

// Component prop types
export interface TaskListProps {
  tasks: Task[];
  onDelete: (id: string) => void;
  onEdit: (id: string, updatedTask: Partial<Task>) => void;
  onComplete: (id: string) => void;
  modalProps?: ModalProps;
}

export interface ModalProps {
  isOpen: boolean;
  openModal?: (task: Task, mode: ModalMode) => void;
  taskToEdit: Task | null;
  closeModal: () => void;
  modalMode: ModalMode;
  onSave: (updatedTask: Partial<Task>) => void;
  defaultDueDate?: string;
}

// Search types
export interface SearchResultTask extends Task {
  type: 'task';
  snippet: string;
  score?: number;
}

export interface SearchResultNote extends Note {
  type: 'note';
  snippet: string;
  score?: number;
}

export interface SearchResultMeeting extends Meeting {
  type: 'meeting';
  snippet: string;
  score?: number;
}

export interface SearchResultMessage extends ChatMessage {
  type: 'message';
  snippet: string;
  score?: number;
}

export interface SearchResults {
  tasks: SearchResultTask[];
  notes: SearchResultNote[];
  meetings: SearchResultMeeting[];
  messages: SearchResultMessage[];
  total: number;
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
export type RecurrenceFreq = 'none' | 'daily' | 'weekly' | 'monthly';
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
