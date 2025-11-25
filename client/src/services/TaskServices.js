// client/src/services/TaskServices.js
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true, // Include cookies for session-based auth
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Session is invalid or expired
            console.error('Authentication failed - redirecting to login');
            // Redirect to login could be handled here
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Fetch all tasks
export const getTasks = async () => {
    try {
        const { data } = await api.get('/tasks');
        console.log('🔄 Raw API response:', data);
        console.log('🔄 Response type:', typeof data);
        console.log('🔄 Is array:', Array.isArray(data));
        console.log('🔄 Length:', data?.length);
        return data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw new Error(error.response?.data?.message || "Error fetching tasks");
    }
};

// Add a new task
export const addTask = async (task) => {
    try {
        const { data } = await api.post('/tasks', { ...task });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error adding task");
    }
};

// Delete a task by id
export const deleteTask = async (_id) => {
    console.log("API URL:", `/tasks/${_id}`);
    try {
        const data = await api.delete(`/tasks/${_id}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error deleting task");
    }
};

// Update a task's status
export const updateTaskStatus = async (_id, status) => {
    try {
        const { data } = await api.patch(`/tasks/${_id}`, { status });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error updating task status");
    }
};

// Edit a task
export const editTask = async (_id, updatedTask) => {
    try {
        const { data } = await api.patch(`/tasks/${_id}`, updatedTask);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error editing task");
    }
};
