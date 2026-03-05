import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Authentication failed - redirecting to login');
        }
        return Promise.reject(error);
    }
);

const formatLocalDate = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const getAgenda = async (date) => {
    try {
        const dateStr = date instanceof Date ? formatLocalDate(date) : date;
        const { data } = await api.get(`/agenda?date=${dateStr}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching agenda");
    }
};
