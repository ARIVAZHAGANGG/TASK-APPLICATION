import api from './api';

/**
 * Sends a message to the Support AI and gets a response.
 * @param {string} message 
 * @param {Object} context - Optional context about current page
 * @returns {Promise<Object>} The AI response
 */
export const sendSupportMessage = async (message, context = {}) => {
    try {
        const response = await api.post('/ai/chat', { message, context });
        return response.data;
    } catch (error) {
        console.error("Support API error:", error);
        throw error;
    }
};

/**
 * Fetches the support chat history for the current user.
 * @returns {Promise<Object>} The chat history
 */
export const getSupportHistory = async () => {
    try {
        const response = await api.get('/ai/support/history');
        return response.data;
    } catch (error) {
        console.error("Support History error:", error);
        throw error;
    }
};
/**
 * Clears the support chat history for the current user.
 * @returns {Promise<Object>}
 */
export const clearSupportHistory = async () => {
    try {
        const response = await api.delete('/ai/support/history');
        return response.data;
    } catch (error) {
        console.error("Clear Support History error:", error);
        throw error;
    }
};
