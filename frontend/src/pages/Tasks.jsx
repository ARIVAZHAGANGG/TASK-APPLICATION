import { Plus, ListTodo, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";
import TaskCard from "../components/ui/TaskCard";
import TaskModal from "../components/ui/TaskModal";
import { useState, useEffect, useCallback, useMemo } from "react";
import useReminder from "../hooks/useReminder";
import { useSearch } from "../context/SearchContext";
import SelectionToolbar from "../components/ui/SelectionToolbar";
import AssignToStudentModal from "../components/ui/AssignToStudentModal";

const Tasks = ({ filter = "all" }) => {
    const location = useLocation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [taskToAssign, setTaskToAssign] = useState(null);
    const [modalTab, setModalTab] = useState("details");

    // AI/Reminder Hooks
    useReminder(tasks);

    const fetchTasks = useCallback(async (pageNum = 1, append = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadMoreLoading(true);

        try {
            let url = "/tasks";
            const params = new URLSearchParams();

            if (filter !== "all") params.append("filter", filter);
            params.append("page", pageNum);
            params.append("limit", 20); // Smaller limit for faster initial load
            
            // Handle studentId filtering from URL
            const queryParams = new URLSearchParams(location.search);
            const userId = queryParams.get('userId');
            if (userId) params.append("userId", userId);

            const queryString = params.toString();
            if (queryString) url += `?${queryString}`;

            const res = await api.get(url);

            const tasksData = res.data.data || res.data;
            const pagination = res.data.pagination;
            
            const finalTasks = Array.isArray(tasksData) ? tasksData : [];
            
            if (append) {
                setTasks(prev => [...prev, ...finalTasks]);
            } else {
                setTasks(finalTasks);
            }

            if (pagination) {
                setTotalPages(pagination.pages || 1);
            }

        } catch (error) {
            toast.error("Failed to fetch tasks");
            console.error(error);
        } finally {
            setLoading(false);
            setLoadMoreLoading(false);
        }
    }, [filter, location.search]);

    const targetStudentName = useMemo(() => {
        if (tasks.length > 0) {
            const queryParams = new URLSearchParams(location.search);
            const userId = queryParams.get('userId');
            if (userId) {
                const assignedTask = tasks.find(t => (t.assignedToUserId?._id || t.assignedToUserId) === userId);
                return assignedTask?.assignedToUserId?.name || "Student";
            }
        }
        return null;
    }, [tasks, location.search]);

    useEffect(() => {
        setSelectedTaskIds([]);
        setPage(1);
        fetchTasks(1, false);
    }, [fetchTasks]);

    const handleLoadMore = () => {
        if (page < totalPages) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchTasks(nextPage, true);
        }
    };

    useEffect(() => {
        const handleRefresh = () => fetchTasks();
        window.addEventListener("refresh-tasks", handleRefresh);
        return () => window.removeEventListener("refresh-tasks", handleRefresh);
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

    const handleCreateOrUpdate = async (formData) => {
        try {
            const id = selectedTask?.id || selectedTask?._id;
            if (id) {
                await api.put(`/tasks/${id}`, formData);
                toast.success("Task updated successfully");
            } else if (Array.isArray(formData)) {
                await Promise.all(formData.map(data => api.post("/tasks", data)));
                toast.success(`${formData.length} tasks created!`);
            } else {
                await api.post("/tasks", formData);
                toast.success("New task created");
            }
            setIsModalOpen(false);
            fetchTasks();
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleToggleSelect = (id) => {
        setSelectedTaskIds(prev =>
            prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
        );
    };

    const handleFinishSelected = async () => {
        if (selectedTaskIds.length === 0) return;

        const currentSelectedIds = [...selectedTaskIds];
        setSelectedTaskIds([]);

        try {
            await api.put(`/tasks/batch-update`, {
                ids: currentSelectedIds,
                updates: { completed: true }
            });
            toast.success(`${currentSelectedIds.length} tasks completed!`);
            fetchTasks();
        } catch (error) {
            toast.error("Failed to complete tasks");
            fetchTasks();
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedTaskIds.length === 0) return;
        if (!window.confirm(`Delete ${selectedTaskIds.length} selected tasks?`)) return;

        const currentSelectedIds = [...selectedTaskIds];
        setSelectedTaskIds([]);

        try {
            // Check if backend supports batch delete, otherwise loop (safer to assume batch-update for now if that's what we have)
            // But let's check if there is a batch delete endpoint. Assuming batch-update can handle 'status: deleted' or similar if implemented.
            // For now, let's use batch-update to set a flag or just loop if needed.
            // If the backend has BatchUpdate, we should probably add BatchDelete.

            // For now, I'll use a loop to ensure compatibility unless I'm sure about batch-delete.
            await Promise.all(currentSelectedIds.map(id => api.delete(`/tasks/${id}`)));

            toast.success(`${currentSelectedIds.length} tasks removed`);
            fetchTasks();
        } catch (error) {
            toast.error("Bulk delete failed");
            fetchTasks();
        }
    };

    const handleToggle = useCallback(async (task) => {
        const taskId = task.id || task._id;
        if (!taskId) {
            console.error("Task ID missing in handleToggle", task);
            return;
        }

        try {
            // Optimistic update
            const updatedStatus = !task.completed;

            // Update local state immediately
            setTasks(prev => prev.map(t => {
                const tId = t.id || t._id;
                return tId === taskId ? { ...t, completed: updatedStatus } : t;
            }));

            // Send to backend
            await api.put(`/tasks/${taskId}`, { completed: updatedStatus });

            toast.success(updatedStatus ? "Objective completed! 🎉" : "Marked as pending");
        } catch (error) {
            console.error("Toggle failed:", error);
            toast.error("Update failed");
            fetchTasks(); // Revert on error
        }
    }, [fetchTasks]);

    const handleDelete = useCallback(async (id) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                const task = tasks.find(t => (t.id || t._id) === id);
                const taskId = task?.id || task?._id || id;
                await api.delete(`/tasks/${taskId}`);
                setTasks(prev => prev.filter(t => (t.id || t._id) !== id));
                toast.success("Task deleted");
            } catch (error) {
                toast.error("Delete failed");
            }
        }
    }, [tasks]);

    const handleAction = useCallback(async (actionId, task) => {
        const taskId = task.id || task._id;

        switch (actionId) {
            case 'toggleComplete':
                handleToggle(task);
                break;
            case 'togglePin':
                try {
                    const res = await api.put(`/tasks/${taskId}/pin`);
                    setTasks(prev => prev.map(t =>
                        (t.id || t._id) === taskId ? { ...t, pinned: res.data.pinned } : t
                    ));
                    toast.success(res.data.pinned ? "Task pinned" : "Task unpinned");
                } catch (error) {
                    toast.error("Failed to pin task");
                }
                break;
            case 'assignToStudent':
            case 'assignToMentor':
                setTaskToAssign(task);
                setIsAssignModalOpen(true);
                break;
            case 'duplicate':
                try {
                    const res = await api.post(`/tasks/${taskId}/duplicate`);
                    toast.success("Task duplicated");
                    fetchTasks();
                } catch (error) {
                    toast.error("Failed to duplicate task");
                }
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
            case 'readAloud':
                if ('speechSynthesis' in window) {
                    const text = `${task.title}. ${task.description || ''}`;
                    const utterance = new SpeechSynthesisUtterance(text);
                    window.speechSynthesis.speak(utterance);
                    toast.info("Reading task aloud...");
                } else {
                    toast.error("Speech synthesis not supported");
                }
                break;
            case 'share':
                if (navigator.share) {
                    navigator.share({
                        title: task.title,
                        text: task.description,
                        url: window.location.href,
                    }).catch(() => { });
                } else {
                    navigator.clipboard.writeText(`${task.title}: ${task.description}`);
                    toast.success("Link copied to clipboard");
                }
                break;
            case 'delete':
                handleDelete(taskId);
                break;
            default:
                break;
        }
    }, [fetchTasks, handleToggle, handleDelete]);

    const SkeletonLoader = () => (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
        </div>
    );

    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 sm:py-40 text-center"
        >
            <div className="relative mb-8 text-slate-200 dark:text-slate-800">
                <svg width="240" height="160" viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                    {/* Background Cards */}
                    <rect x="40" y="40" width="80" height="100" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                    <rect x="120" y="40" width="80" height="100" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                    
                    {/* Main Central Card */}
                    <rect x="70" y="20" width="100" height="120" rx="8" fill="white" className="dark:fill-slate-900" stroke="currentColor" strokeWidth="2"/>
                    
                    {/* Person Icon in Circle */}
                    <circle cx="120" cy="55" r="15" stroke="currentColor" strokeWidth="2"/>
                    <path d="M108 80C108 73.3726 113.373 68 120 68V68C126.627 68 132 73.3726 132 80" stroke="currentColor" strokeWidth="2"/>
                    
                    {/* Task Lines */}
                    <circle cx="95" cy="100" r="3" stroke="currentColor" strokeWidth="2"/>
                    <rect x="105" y="99" width="40" height="2" rx="1" fill="currentColor" fillOpacity="0.3"/>
                    
                    <circle cx="95" cy="115" r="3" stroke="currentColor" strokeWidth="2"/>
                    <rect x="105" y="114" width="40" height="2" rx="1" fill="currentColor" fillOpacity="0.3"/>
                </svg>
            </div>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-[280px] sm:max-w-md mx-auto font-medium leading-relaxed px-4">
                Tasks assigned to you in To Do or Planner show up here
            </p>
        </motion.div>
    );

    const { searchTerm } = useSearch();

    const filteredTasks = useMemo(() => {
        let result = tasks;

        // 2. Search Filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(task =>
                task.title?.toLowerCase().includes(lowerSearch) ||
                task.description?.toLowerCase().includes(lowerSearch)
            );
        }

        // 3. Sort: Pinned first, then by createdAt (newest first)
        return [...result].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [tasks, searchTerm]);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-4 pb-24 md:pb-20 overflow-x-hidden pt-4 md:pt-0">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex flex-col gap-1.5 sm:gap-1">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[280px] sm:max-w-none">
                        {targetStudentName ? `${targetStudentName}'s Tasks` : "Objectives"}
                    </h2>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                            {filteredTasks.filter(t => !t.completed).length} Pending
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                            {filteredTasks.length} Total
                        </span>
                    </div>
                </div>
            </div>


            <SelectionToolbar
                selectedCount={selectedTaskIds.length}
                onComplete={handleFinishSelected}
                onDelete={handleDeleteSelected}
                onCancel={() => setSelectedTaskIds([])}
            />


            {loading ? (
                <SkeletonLoader />
            ) : filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {filteredTasks.map((task) => (
                            <TaskCard
                                key={task.id || task._id}
                                task={task}
                                isSelected={selectedTaskIds.includes(task.id || task._id)}
                                onSelect={() => handleToggleSelect(task.id || task._id)}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                                onEdit={(task) => { setSelectedTask(task); setIsModalOpen(true); }}
                                onAction={handleAction}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <EmptyState />
            )}

            {page < totalPages && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadMoreLoading}
                        className="px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm disabled:opacity-50"
                    >
                        {loadMoreLoading ? "Loading..." : "Load More Tasks"}
                    </button>
                </div>
            )}

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateOrUpdate}
                task={selectedTask}
                initialTab={modalTab}
            />

            <AssignToStudentModal
                isOpen={isAssignModalOpen}
                onClose={() => {
                    setIsAssignModalOpen(false);
                    setTaskToAssign(null);
                }}
                task={taskToAssign}
                onAssigned={() => fetchTasks()}
            />
        </div>
    );
};

export default Tasks;
