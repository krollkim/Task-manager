import { useState, useEffect } from 'react';
import { getTasks, addTask, deleteTask, editTask, updateTaskStatus } from '../services/TaskServices';
import { Task } from '../types/types';
import { ModalMode } from '../types/types';


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
                setTasks(fetchedTasks);
            } catch (error) {
                console.error(error.message);
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
