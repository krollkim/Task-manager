import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

axios.defaults.withCredentials = true;

// Register a new user
export const registerUser = async (userData) => {
    try {
        const { data } = await axios.post(`${apiUrl}/register`, userData);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Registration failed");
    }
};

// Login user
export const loginUser = async (credentials) => {
    try {
        const { data } = await axios.post(`${apiUrl}/login`, credentials);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Login failed");
    }
};

// Logout user (call server to clear cookie)
export const logoutUser = async () => {
    try {
        await axios.post(`${apiUrl}/logout`);
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// Check if user is authenticated by calling server
export const checkAuthStatus = async () => {
    try {
        const { data } = await axios.get(`${apiUrl}/me`);
        return data.user;
    } catch (error) {
        return null;
    }
};

// Legacy functions - יוסרו בעתיד
export const isAuthenticated = () => {
    return false;
};

export const getCurrentUser = () => {
    return null;
};

export const getToken = () => {
    return null;
}; 