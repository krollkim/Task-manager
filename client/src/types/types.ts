
//types.ts

export type ModalMode = "edit" | "preview";

export interface Task {
    _id: string;
    task: string;
    createdAt: string;
    status: 'todo' | 'in-progress' | 'done';
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    estimateMinutes?: number;
    spentMinutes?: number;
}

export interface TaskListProps {
    tasks: Task[];
    onDelete: (id: string) => void;
    onEdit: (id: string, updatedTask: Partial<Task>) => void;
    onComplete: (id: string) => void;
    modalProps?: ModalProps
}

export interface Meeting {
  _id: string;
  title: string;
  date: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  pinned: boolean;
  userId: string;
  date?: string;
  createdAt: string;
}

export interface AgendaData {
  tasks: Task[];
  notes: Note[];
  meetings: Meeting[];
}

export type AgendaView = 'day' | 'week' | 'month';

export interface WeekAgendaDay {
  date: Date;
  label: string;
  agenda: AgendaData;
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

export interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  linkedItemId: string | null;
  linkedItemType: 'task' | 'note' | 'meeting' | null;
  createdAt: string;
}

export interface PresenceUser {
  userId: string;
  name: string;
  avatar: string | null;
}