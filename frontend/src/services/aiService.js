import api from './api';

export const askTaskAssistant = async (message) => {
    try {
        const response = await api.post('/ai/task-intelligence', { message });
        return response.data;
    } catch (error) {
        throw error;
    }
};
