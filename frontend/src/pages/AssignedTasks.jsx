import { Plus, ListTodo, Users, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";
import TaskCard from "../components/ui/TaskCard";
import TaskModal from "../components/ui/TaskModal";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearch } from "../context/SearchContext";
import Button from "../components/ui/Button";

const AssignedTasks = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState("details");
    const { searchTerm } = useSearch();

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/tasks?filter=assigned_by_me");
            const tasksData = res.data.data || res.data;
            setTasks(Array.isArray(tasksData) ? tasksData : []);
        } catch (error) {
            toast.error("Failed to fetch assigned tasks");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const filteredTasks = useMemo(() => {
        let result = tasks;
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(task =>
                task.title?.toLowerCase().includes(lowerSearch) ||
                task.description?.toLowerCase().includes(lowerSearch) ||
                task.assignedToUserId?.name?.toLowerCase().includes(lowerSearch)
            );
        }
        return [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [tasks, searchTerm]);

    const handleAction = useCallback(async (actionId, task) => {
        const taskId = task.id || task._id;
        if (actionId === 'edit' || actionId === 'details') {
            setSelectedTask(task);
            setModalTab("details");
            setIsModalOpen(true);
        } else if (actionId === 'chat') {
            setSelectedTask(task);
            setModalTab("chat");
            setIsModalOpen(true);
        } else if (actionId === 'delete') {
            if (window.confirm("Delete this assigned task?")) {
                try {
                    await api.delete(`/tasks/${taskId}`);
                    setTasks(prev => prev.filter(t => (t.id || t._id) !== taskId));
                    toast.success("Task deleted");
                } catch (error) {
                    toast.error("Delete failed");
                }
            }
        }
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-1">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors mb-2 text-xs font-black uppercase tracking-widest"
                    >
                        <ArrowLeft size={14} /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Command Deployments</h1>
                    <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-2">Tracking all objectives assigned by you</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Deployments</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{tasks.length}</p>
                    </div>
                    <Button 
                        onClick={() => navigate("/assign-task")}
                        className="rounded-2xl h-12 px-6 flex items-center gap-2"
                    >
                        <Plus size={18} /> New Deployment
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-3xl border border-slate-200 dark:border-slate-800" />)}
                </div>
            ) : filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.map((task) => (
                            <motion.div
                                key={task.id || task._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <TaskCard
                                    task={task}
                                    onAction={handleAction}
                                    showAssignee={true} // Custom prop to show who it was assigned to
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
                        <Users size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">No active deployments</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto text-sm font-medium">
                        You haven't assigned any tasks yet. Head over to Task Assignment to begin.
                    </p>
                    <Button 
                        variant="soft"
                        onClick={() => navigate("/assign-task")}
                        className="mt-8 rounded-xl"
                    >
                        Go to Assignment
                    </Button>
                </div>
            )}

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

export default AssignedTasks;
