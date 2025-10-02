// client/src/services/TaskServices.js
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5003";

// Fetch all tasks
export const getTasks = async () => {
    try {
        const { data } = await axios.get(`${apiUrl}/tasks`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching tasks");
    }
};

// Add a new task
export const addTask = async (task) => {
    try {
        const { data } = await axios.post(`${apiUrl}/tasks`, { ...task });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error adding task");
    }
};

// Delete a task by id
export const deleteTask = async (_id) => {
    console.log("API URL:", `${apiUrl}/tasks/${_id}`);
    try {
        const  data  = await axios.delete(`${apiUrl}/tasks/${_id}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error deleting task");
    }
};

// Update a task's status
export const updateTaskStatus = async (_id, status) => {
    try {
        const { data } = await axios.patch(`${apiUrl}/tasks/${_id}`, { status });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating task status");
    }
};

// Edit a task
export const editTask = async (_id, updatedTask) => {
    try {
        const { data } = await axios.patch(`${apiUrl}/tasks/${_id}`, updatedTask);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error editing task");
    }
};
