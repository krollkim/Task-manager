import { useState, useEffect } from 'react';
import { Task } from '@/types/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const getTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_URL}/tasks`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  const { data } = await response.json();
  return Array.isArray(data) ? data : [];
};

const addTask = async (task: Omit<Task, '_id' | 'createdAt'>): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error('Failed to add task');
  return response.json();
};

const deleteTask = async (_id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/tasks/${_id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete task');
};

const editTask = async (
  _id: string,
  updates: Partial<Task>
): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${_id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to edit task');
  return response.json();
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('edit');

  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };
    loadTasks();
  }, []);

  const handleAddTask = async (newTask: Omit<Task, '_id' | 'createdAt'>) => {
    try {
      const addedTask = await addTask(newTask);
      setTasks((prev) => [...prev, addedTask]);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const handleDelete = async (_id: string) => {
    try {
      await deleteTask(_id);
      setTasks((prev) => prev.filter((task) => task._id !== _id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const handleEdit = async (_id: string, updatedTask: Partial<Task>) => {
    try {
      const editedTask = await editTask(_id, updatedTask);
      setTasks((prev) =>
        prev.map((task) => (task._id === _id ? { ...task, ...editedTask } : task))
      );
    } catch (error) {
      console.error('Error editing task:', error);
      throw error;
    }
  };

  const openModal = (task: Task, mode: 'add' | 'edit') => {
    setTaskToEdit(task);
    setModalMode(mode);
    setIsOpen(true);
  };

  const closeModal = () => {
    setTaskToEdit(null);
    setIsOpen(false);
  };

  return {
    tasks,
    taskToEdit,
    isOpen,
    modalMode,
    openModal,
    closeModal,
    handleAddTask,
    handleDelete,
    handleEdit,
  };
};
