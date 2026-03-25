import api from './api';

export const getActivities = () => api.get('/activity-log');
export const clearActivities = () => api.delete('/activity-log');
