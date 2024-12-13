
//types.ts

export type ModalMode = "edit" | "preview";

export interface Task {
    _id: string;
    task: string;
    createdAt: string;
    status: 'todo' | 'in-progress' | 'done';
    description: string;
}

export interface TaskListProps {
    tasks: Task[];
    onDelete: (id: string) => void;
    onEdit: (id: string, updatedTask: Partial<Task>) => void;
    onComplete: (id: string) => void;
    modalProps?: ModalProps
}

export interface ModalProps {
  isOpen: boolean;
  openModal?: (task: Task, mode: ModalMode) => void;
  taskToEdit: Task | null;
  closeModal: () => void;
  modalMode: ModalMode;
  onSave: (updatedTask: Partial<Task>) => void;
}