import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Send, Loader2, User as UserIcon, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';
import Button from './Button';
import { useAuth } from '../../context/AuthContext';

const AssignToStudentModal = ({ isOpen, onClose, task, onAssigned }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const isMentor = user?.role === 'mentor';

    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && task) {
            fetchUsers();
            setSelectedUserIds([]);
        }
    }, [isOpen, task]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            if (isAdmin) {
                const res = await api.get("/admin/staff");
                setUsers(res.data.filter(u => u.role === 'mentor'));
            } else {
                const res = await api.get("/admin/students");
                setUsers(res.data);
            }
        } catch (error) {
            toast.error(`Failed to load ${isAdmin ? 'mentors' : 'students'}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (id) => {
        setSelectedUserIds(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const handleAssign = async () => {
        if (selectedUserIds.length === 0) {
            return toast.error(`Please select at least one ${isAdmin ? 'mentor' : 'student'}`);
        }

        setIsSubmitting(true);
        try {
            const promises = selectedUserIds.map(targetUserId =>
                api.post("/tasks", {
                    title: task.title,
                    description: task.description || "",
                    priority: task.priority || "medium",
                    dueDate: task.dueDate,
                    assignedToUserId: targetUserId,
                    assignedToRole: isAdmin ? 'mentor' : 'student',
                    parentTaskId: task.id || task._id,
                    createdByRole: user.role,
                    status: isAdmin ? 'assigned' : 'todo'
                })
            );
            await Promise.all(promises);
            toast.success(`Task assigned to ${selectedUserIds.length} ${isAdmin ? 'mentors' : 'students'}!`);
            onAssigned?.();
            onClose();
        } catch (error) {
            toast.error("Failed to assign tasks");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!task) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Assign Task</h2>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 truncate max-w-[250px]">
                                            Delegating: {task.title}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                {loading ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl" />)
                                ) : users.length > 0 ? (
                                    users.map((targetUser) => (
                                        <button
                                            key={targetUser._id}
                                            onClick={() => toggleUser(targetUser._id)}
                                            className={cn(
                                                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                                                selectedUserIds.includes(targetUser._id)
                                                    ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 ring-2 ring-blue-500/10"
                                                    : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden">
                                                {targetUser.avatar ? (
                                                    <img src={targetUser.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon size={20} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{targetUser.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{targetUser.email}</p>
                                            </div>
                                            {selectedUserIds.includes(targetUser._id) && (
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                                    <CheckCircle2 size={14} />
                                                </div>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-slate-400 font-bold text-sm italic">No {isAdmin ? 'mentors' : 'students'} found in registry</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleAssign}
                                    disabled={selectedUserIds.length === 0 || isSubmitting}
                                    className="saas-button py-4 w-full flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                    <span className="font-black uppercase tracking-widest text-xs">Deploy Task to {selectedUserIds.length} {isAdmin ? 'Mentor' : 'Student'}{selectedUserIds.length !== 1 ? 's' : ''}</span>
                                </Button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-black uppercase tracking-widest text-[10px] transition-colors"
                                >
                                    Cancel Mission
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AssignToStudentModal;
