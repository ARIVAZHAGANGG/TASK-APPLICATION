import React, { useState, useEffect, useCallback } from 'react';
import { getMyTasks } from '../services/taskService';
import api from '../services/api';
import TaskCard from '../components/ui/TaskCard';
import TaskModal from '../components/ui/TaskModal';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Search, Filter, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useSearch } from '../context/SearchContext';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalTab, setModalTab] = useState("details");

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await getMyTasks();

            setTasks(response.data.data || response.data || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch your tasks.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!id) {
            console.error("Invalid ID passed to handleDelete");
            toast.error("Error: Invalid Task ID");
            return;
        }
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(prev => prev.filter(t => (t.id || t._id) !== id));
            toast.success("Task deleted successfully");
            // Trigger global refresh if needed, but local state update is faster
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const handleToggle = async (task) => {
        const taskId = task.id || task._id;
        if (!taskId) {
            console.error("Invalid Task passed to handleToggle", task);
            return;
        }
        try {
            // Optimistic update
            const updatedStatus = !task.completed;
            setTasks(prev => prev.map(t => (t.id || t._id) === taskId ? { ...t, completed: updatedStatus } : t));

            const res = await api.put(`/tasks/${taskId}`, { completed: updatedStatus });

            // Revert or update with server data
            const serverTask = res.data.data || res.data;
            setTasks(prev => prev.map(t => (t.id || t._id) === taskId ? serverTask : t));

            toast.success(updatedStatus ? "Task completed! 🎉" : "Task marked as todo");
        } catch (err) {
            console.error(err);
            toast.error("Update failed");
            fetchTasks(); // Revert on error
        }
    };

    const handleEdit = useCallback((task) => {
        setSelectedTask(task);
        setModalTab("details");
        setIsModalOpen(true);
    }, []);

    const handleAction = useCallback(async (actionId, task) => {
        const taskId = task.id || task._id;

        switch (actionId) {
            case 'toggleComplete':
                handleToggle(task);
                break;
            case 'edit':
            case 'details':
                setSelectedTask(task);
                setModalTab("details");
                setIsModalOpen(true);
                break;
            case 'chat':
                setSelectedTask(task);
                setModalTab("chat");
                setIsModalOpen(true);
                break;
            case 'delete':
                handleDelete(taskId);
                break;
            default:
                break;
        }
    }, []);

    const handleSave = async (taskData) => {
        try {
            if (selectedTask) {
                // Update
                const taskId = selectedTask.id || selectedTask._id;
                const res = await api.put(`/tasks/${taskId}`, taskData);
                const updatedTask = res.data.data || res.data;
                setTasks(prev => prev.map(t => (t.id || t._id) === taskId ? updatedTask : t));
                toast.success("Task updated successfully");
            } else if (Array.isArray(taskData)) {
                // Bulk Create
                await Promise.all(taskData.map(data => api.post("/tasks", data)));
                toast.success(`${taskData.length} tasks registered!`);
                fetchTasks();
            } else {
                // Single Create
                const res = await api.post('/tasks', taskData);
                const newTask = res.data.data || res.data;
                setTasks(prev => [newTask, ...prev]);
                toast.success("Task created successfully");
            }
            setIsModalOpen(false);
            setSelectedTask(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save task");
        }
    };

    const { searchTerm } = useSearch();

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
                    <p className="text-slate-500">Manage all duties created by you.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
                        className="p-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Loading your tasks...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-center">
                    <p>{error}</p>
                    <button onClick={fetchTasks} className="mt-4 text-sm font-bold underline">Try Again</button>
                </div>
            ) : filteredTasks.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {filteredTasks.map(task => (
                            <TaskCard
                                key={task._id || task.id}
                                task={task}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                                onAction={handleAction}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No tasks found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">
                        {searchTerm ? "No tasks match your search criteria." : "You haven't created any tasks yet. Start by adding one!"}
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition"
                    >
                        Create First Task
                    </button>
                </div>
            )}

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                task={selectedTask}
                initialTab={modalTab}
            />
        </div>
    );
};

export default MyTasks;
