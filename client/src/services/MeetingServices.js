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

export const getMeetings = async () => {
    try {
        const { data } = await api.get('/meetings');
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching meetings");
    }
};

export const getMeeting = async (id) => {
    try {
        const { data } = await api.get(`/meetings/${id}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error fetching meeting");
    }
};

export const addMeeting = async (meeting) => {
    try {
        const { data } = await api.post('/meetings', meeting);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error adding meeting");
    }
};

export const editMeeting = async (id, updatedMeeting) => {
    try {
        const { data } = await api.patch(`/meetings/${id}`, updatedMeeting);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error editing meeting");
    }
};

export const deleteMeeting = async (id) => {
    try {
        const { data } = await api.delete(`/meetings/${id}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error deleting meeting");
    }
};

/**
 * Scoped edit/delete for recurring meetings.
 * @param {string} baseId   - The _id of the isRecurringBase meeting
 * @param {{ scope: 'this'|'following', action: 'edit'|'delete', date: string, data?: object }} params
 */
export const editRecurringMeeting = async (baseId, { scope, action, date, data }) => {
    try {
        const { data: result } = await api.patch(`/meetings/${baseId}/recurring`, {
            scope,
            action,
            date,
            data,
        });
        return result;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Error editing recurring meeting");
    }
};
