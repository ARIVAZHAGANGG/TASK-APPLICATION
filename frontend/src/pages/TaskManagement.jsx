import { useState, useEffect } from "react";
import { ListTodo, Search, Filter, ShieldAlert, CheckCircle2, Clock, Flag, User, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";
import { cn } from "../utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import TaskCard from "../components/ui/TaskCard";
import TaskModal from "../components/ui/TaskModal";
import { useCallback } from "react";

const TaskManagement = () => {
    const location = useLocation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalTab, setModalTab] = useState("details");

    const fetchTasks = useCallback(async () => {
        try {
            const res = await api.get("/admin/tasks");
            // Normalize for TaskCard (assignedTo -> assignedToUserId)
            const normalized = res.data.map(t => ({
                ...t,
                id: t._id,
                assignedToUserId: t.assignedTo || t.assignedToUserId
            }));
            setTasks(normalized || []);
        } catch (error) {
            toast.error("Failed to load global tasks");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Handle opening task from URL (e.g. from notifications)
    useEffect(() => {
        if (tasks.length > 0) {
            const queryParams = new URLSearchParams(location.search);
            const taskId = queryParams.get('highlight') || queryParams.get('taskId');
            const tab = queryParams.get('tab');

            if (taskId) {
                const task = tasks.find(t => (t.id || t._id) === taskId);
                if (task) {
                    setSelectedTask(task);
                    if (tab) setModalTab(tab);
                    setIsModalOpen(true);
                }
            }
        }
    }, [tasks, location.search]);

    const handleAction = useCallback(async (actionId, task) => {
        const taskId = task.id || task._id;

        switch (actionId) {
            case 'toggleComplete':
                try {
                    const updatedStatus = !task.completed;
                    setTasks(prev => prev.map(t => (t.id || t._id) === taskId ? { ...t, completed: updatedStatus } : t));
                    await api.put(`/tasks/${taskId}`, { completed: updatedStatus });
                    toast.success("Status updated");
                } catch (error) {
                    toast.error("Failed to update status");
                    fetchTasks();
                }
                break;
            case 'details':
            case 'edit':
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
                if (window.confirm("Delete this task permanently?")) {
                    try {
                        await api.delete(`/tasks/${taskId}`);
                        setTasks(prev => prev.filter(t => (t.id || t._id) !== taskId));
                        toast.success("Task deleted");
                    } catch (error) {
                        toast.error("Delete failed");
                    }
                }
                break;
            default:
                break;
        }
    }, [fetchTasks]);

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.assignedTo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
                            (filterStatus === 'completed' ? t.completed : !t.completed);
        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary-500" size={48} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Task Oversight</h1>
                    <p className="text-slate-500 font-medium">Global mission status and assignment tracking.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search missions or students..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="saas-input pl-12 h-12"
                        />
                    </div>
                    <select 
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="saas-input w-40 h-12"
                    >
                        <option value="all">All Missions</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </header>

            <div className="space-y-4">
                <AnimatePresence>
                    {filteredTasks.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredTasks.map((task) => (
                                <TaskCard
                                    key={task._id || task.id}
                                    task={task}
                                    onAction={handleAction}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
                            <ListTodo className="mx-auto text-slate-300 mb-6" size={48} />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Active Deployments</h3>
                            <p className="text-slate-500 mt-2 font-medium">Global task list is currently empty under these filters.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchTasks}
                task={selectedTask}
                initialTab={modalTab}
            />
        </div>
    );
};

export default TaskManagement;
