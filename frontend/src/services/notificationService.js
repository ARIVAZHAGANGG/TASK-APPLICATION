import api from './api';

export const getNotifications = () => api.get('/notifications');

export const markAsRead = (id) => api.put(`/notifications/read/${id}`);

export const markAllAsRead = () => api.put('/notifications/read-all');

export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

export const clearAllNotifications = () => api.delete('/notifications/clear');
export const clearNotifications = () => api.delete('/notifications/clear');
