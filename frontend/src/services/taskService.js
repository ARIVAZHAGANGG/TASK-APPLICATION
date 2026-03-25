import api from './api';

// Task operations
export const getTasks = (filter) => api.get(`/tasks${filter ? `?filter=${filter}` : ''}`);
export const createTask = (taskData) => api.post('/tasks', taskData);
export const updateTask = (id, updates) => api.put(`/tasks/${id}`, updates);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getMyTasks = () => api.get('/tasks/user');

// Kanban operations
export const getKanbanTasks = () => api.get('/tasks/kanban');
export const updateTaskStatus = (id, status) => api.put(`/tasks/${id}/status`, { status });

// Subtask operations
export const addSubtask = (taskId, subtaskData) => api.post(`/tasks/${taskId}/subtasks`, subtaskData);
export const toggleSubtask = (taskId, subtaskId) => api.put(`/tasks/${taskId}/subtasks/${subtaskId}`);
export const deleteSubtask = (taskId, subtaskId) => api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);

// Tag operations
export const getTags = () => api.get('/tasks/tags');
export const getTasksByTag = (tag) => api.get(`/tasks/tags/${tag}`);

// Analytics & Stats
export const getTaskStats = () => api.get('/tasks/stats');
export const getGraphData = () => api.get('/tasks/graph-data');
export const getOverdueTasks = () => api.get('/tasks/overdue');
