import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    User as UserIcon, ArrowLeft, Edit2, Save, X,
    Mail, Shield, Award, Calendar as CalendarIcon, CheckCircle2,
    Clock, ListTodo, Loader2, Check, Trash2, TrendingUp, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../utils/cn";
import api from "../services/api";
import { useOnlineUsers } from "../context/SocketContext";

const MentorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [mentor, setMentor] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("tasks");
    const onlineUsersList = useOnlineUsers() || [];

    // Edit modal state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", email: "" });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                // Fetch mentor from staff list
                const staffRes = await api.get("/admin/staff");
                const found = staffRes.data.find(u => (u._id === id || u.id === id));
                if (!found) {
                    toast.error("Mentor not found");
                    navigate(-1);
                    return;
                }
                setMentor(found);
                setEditForm({ name: found.name || "", email: found.email || "" });

                // Fetch tasks assigned BY this mentor
                const taskRes = await api.get("/tasks");
                const allTasks = taskRes.data.data || taskRes.data || [];
                const mentorTasks = allTasks.filter(t =>
                    (t.assignedBy === id || t.assignedBy?._id === id ||
                     t.creatorId === id || t.creatorId?._id === id)
                );
                setTasks(mentorTasks);

                // Fetch history
                try {
                    const hisRes = await api.get(`/history/user/${id}`);
                    const hisData = hisRes.data.success ? hisRes.data.data : (Array.isArray(hisRes.data) ? hisRes.data : []);
                    setHistory(hisData);
                } catch (_) {
                    setHistory([]);
                }
            } catch (err) {
                toast.error("Failed to load mentor profile");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchAll();
    }, [id, navigate]);

    const handleSaveEdit = async () => {
        if (!editForm.name.trim()) return toast.error("Name is required");
        setIsSaving(true);
        try {
            // Update via auth update – admin can do this through a direct PUT
            await api.put(`/admin/users/${id}`, { name: editForm.name, email: editForm.email });
            setMentor(prev => ({ ...prev, name: editForm.name, email: editForm.email }));
            toast.success("Mentor profile updated!");
            setIsEditing(false);
        } catch (err) {
            // Try alternative endpoint
            try {
                await api.put(`/auth/admin/update/${id}`, { name: editForm.name, email: editForm.email });
                setMentor(prev => ({ ...prev, name: editForm.name, email: editForm.email }));
                toast.success("Mentor profile updated!");
                setIsEditing(false);
            } catch {
                toast.error("Update failed – contact backend admin");
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary-500" size={48} />
        </div>
    );

    if (!mentor) return null;

    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;

    const tabs = [
        { id: "tasks", label: "Assigned Tasks", icon: ListTodo },
        { id: "history", label: "History", icon: Clock },
    ];

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-widest mb-6 transition-colors group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Mentor List
            </button>

            {/* Profile Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[36px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6"
            >
                {/* Top color bar */}
                <div className="h-1.5 bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500" />

                <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[20px] sm:rounded-[24px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm flex-shrink-0">
                            {mentor.avatar ? (
                                <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover rounded-[20px]" />
                            ) : (
                                <UserIcon size={36} className="sm:size-10" />
                            )}
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center sm:justify-start mb-1">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {mentor.name}
                                </h1>
                                {onlineUsersList.includes(mentor.id || mentor._id) ? (
                                    <div className="self-center flex-shrink-0 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] border-2 border-white dark:border-slate-900" title="Online"></div>
                                ) : (
                                    <div className="self-center flex-shrink-0 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] border-2 border-white dark:border-slate-900" title="Offline"></div>
                                )}
                            </div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Verified Mentor</p>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs font-bold text-slate-500 items-center sm:items-start">
                                <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-300" />{mentor.email}</span>
                                <span className="flex items-center gap-1.5"><Shield size={12} className="text-slate-300" />Staff ID: {mentor.staffId || "N/A"}</span>
                                <span className="flex items-center gap-1.5"><Award size={12} className="text-slate-300" />Since: {new Date(mentor.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-sm flex-shrink-0"
                        >
                            <Edit2 size={12} /> Edit Profile
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                        {[
                            { label: "Total Tasks", value: tasks.length, icon: ListTodo, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/10" },
                            { label: "Completed", value: completedTasks, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
                            { label: "Pending", value: pendingTasks, icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/10" },
                        ].map(stat => (
                            <div key={stat.label} className={`${stat.bg} rounded-2xl p-3 sm:p-4 text-center`}>
                                <stat.icon size={18} className={`${stat.color} mx-auto mb-1`} />
                                <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                                <p className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-50 dark:bg-slate-900 rounded-2xl p-1 mb-6 border border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest whitespace-nowrap flex-1 justify-center",
                            activeTab === tab.id
                                ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm border border-slate-100 dark:border-slate-700"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        )}
                    >
                        <tab.icon size={13} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                >
                    {activeTab === "tasks" && (
                        <div className="space-y-3">
                            {tasks.length > 0 ? tasks.map((task, i) => (
                                <motion.div
                                    key={task._id || task.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-start gap-4 hover:border-primary-500/30 transition-all group"
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                                        task.completed
                                            ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-900/10"
                                            : "bg-amber-50 text-amber-500 dark:bg-amber-900/10"
                                    )}>
                                        {task.completed ? <Check size={14} strokeWidth={3} /> : <Clock size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "font-black text-sm text-slate-900 dark:text-white",
                                            task.completed && "line-through text-slate-400"
                                        )}>{task.title}</p>
                                        {task.description && (
                                            <p className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1">{task.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                                            {task.dueDate && (
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <CalendarIcon size={9} />
                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                            {task.assignedToName && (
                                                <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">
                                                    → {task.assignedToName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border flex-shrink-0",
                                        task.completed
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800"
                                            : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800"
                                    )}>
                                        {task.completed ? "Done" : "Pending"}
                                    </span>
                                </motion.div>
                            )) : (
                                <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <BookOpen size={28} />
                                    </div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No tasks assigned by this mentor</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div>
                            {history.length > 0 ? (
                                <div className="relative pl-6 sm:pl-8 space-y-4 sm:space-y-6 before:absolute before:left-[9px] sm:before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                                    {history.map((item, idx) => (
                                        <div key={item._id || idx} className="relative group">
                                            <div className="absolute -left-[25px] sm:-left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-slate-950 bg-primary-500 z-10 group-hover:scale-125 transition-transform" />
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <span className="text-[8px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700 w-fit">
                                                    {new Date(item.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary-100 dark:hover:border-primary-900/30 transition-all hover:shadow-md">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "p-1.5 sm:p-2 rounded-xl text-white flex-shrink-0",
                                                        item.action?.includes('delete') ? "bg-red-500" :
                                                            item.action?.includes('complete') ? "bg-green-500" : "bg-blue-500"
                                                    )}>
                                                        {item.action?.includes('complete') ? <Check size={12} strokeWidth={4} /> :
                                                            item.action?.includes('delete') ? <Trash2 size={12} /> : <ListTodo size={12} />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{item.message}</p>
                                                        {item.action && (
                                                            <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">{item.action}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Clock size={28} />
                                    </div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No history available</p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && setIsEditing(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 sm:p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Edit Mentor</h2>
                                    <p className="text-xs text-slate-400 font-medium">Update mentor profile details</p>
                                </div>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Full Name</label>
                                    <input
                                        value={editForm.name}
                                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                        className="saas-input h-12 text-sm"
                                        placeholder="Mentor's full name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Email Address</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                                        className="saas-input h-12 text-sm"
                                        placeholder="mentor@example.com"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                    className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MentorProfile;
