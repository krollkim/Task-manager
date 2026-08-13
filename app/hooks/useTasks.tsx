import { useState, useEffect } from 'react';
import { Task } from '@/types/types';
import { ModalMode } from '@/types/types';

const getTasks = async () => {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
};

const addTask = async (newTask: any) => {
    const response = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTask) });
    if (!response.ok) throw new Error('Failed to add task');
    return response.json();
};

const deleteTask = async (id: string) => {
    const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete task');
    return response.json();
};

const editTask = async (id: string, updates: any) => {
    const response = await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (!response.ok) throw new Error('Failed to edit task');
    return response.json();
};

const updateTaskStatus = async (id: string, status: string) => {
    const response = await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (!response.ok) throw new Error('Failed to update task status');
    return response.json();
};


export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>("edit");

    // Load tasks on mount
    useEffect(() => {
        const loadTasks = async () => {
            try {
                const fetchedTasks = await getTasks();
                console.log('📋 Fetched tasks:', fetchedTasks);
                console.log('📋 Tasks count:', fetchedTasks?.length || 0);
                setTasks(fetchedTasks);
            } catch (error) {
                console.error('❌ Error loading tasks:', error.message);
            }
        };
        loadTasks();
    }, []);

    const handleAddTask = async (newTask: Omit<Task, '_id' | 'createdAt'>) => {
        try {
            const addedTask = await addTask(newTask);
            setTasks((prev) => [...prev, addedTask]);
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleDelete = async (_id: string) => {
        console.log("Deleting task with ID:", _id);
        try {
            await deleteTask(_id);
            setTasks((prev) => prev.filter((task) => task._id !== _id));
        } catch (error) {
            console.error("Error deleting task:", error.message);
        }
    };

    const handleEdit = async (_id: string, updatedTask: Partial<Task>) => {
        try {
            const editedTask = await editTask(_id, updatedTask);
            setTasks((prev) =>
                prev.map((task) => (task._id === _id ? { ...task, ...editedTask } : task))
            );
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleComplete = async (id: string) => {
        try {
            const updatedTask = await updateTaskStatus(id, 'done');
            setTasks((prev) =>
                prev.map((task) => (task._id === id ? { ...task, status: updatedTask.status } : task))
            );
        } catch (error) {
            console.error(error.message);
        }
    };

    const openModal = (task: Task, mode: ModalMode) => {
        console.log('Mode:', mode);
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
        handleComplete,
    };
};
