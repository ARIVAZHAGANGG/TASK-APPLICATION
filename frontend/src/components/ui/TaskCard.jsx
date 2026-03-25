import React, { useState, useRef } from "react";
import {
    CheckCircle2,
    Check,
    AlertCircle,
    ListTodo,
    Calendar,
    Trash2,
    Edit3,
    Clock,
    Bell,
    AlertTriangle,
    MoreVertical,
    Pin,
    Tag,
    Target,
    ExternalLink,
    MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import TaskActionMenu from "./TaskActionMenu";
import { useNavigate } from "react-router-dom";

const TaskCard = ({
    task,
    isSelected = false,
    onSelect,
    onToggle,
    onDelete,
    onEdit,
    onPin,
    onDuplicate,
    onAction
}) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [anchorRect, setAnchorRect] = useState(null);
    const menuButtonRef = useRef(null);

    // Destructure task for easier access in the JSX
    const { title, description, priority, completed, category, dueDate, subtasks } = task;

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const priorityConfig = {
        high: { color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", gradient: "from-red-500/10 to-transparent", label: "High" },
        medium: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", gradient: "from-amber-500/10 to-transparent", label: "Medium" },
        low: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-500/10 to-transparent", label: "Low" },
    };

    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ y: -4 }}
            className={cn(
                "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[32px] border border-white/20 dark:border-slate-800/50 transition-all duration-300 shadow-sm relative group cursor-pointer",
                completed && "opacity-75"
            )}
            onClick={() => onAction?.('details', task)}
        >
            {/* Priority Indicator Stripe */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl",
                priority === 'high' ? "bg-red-500" :
                    priority === 'medium' ? "bg-amber-500" : "bg-green-500"
            )} />

            <div className="p-6 relative z-10">
                <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!completed) {
                                onToggle?.(task);
                            }
                        }}
                        className={cn(
                            "mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shrink-0",
                            completed
                                ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20 cursor-not-allowed"
                                : "border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer"
                        )}
                        disabled={completed}
                    >
                        {completed && <Check size={14} strokeWidth={4} />}
                    </button>

                    <div className="flex-1 min-w-0">
                        {/* Title and Top Badges */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                                {task.pinned && <Pin size={14} className="text-primary-500 rotate-45 shrink-0" fill="currentColor" />}
                                <h3 className={cn(
                                    "text-lg font-black tracking-tight transition-all truncate",
                                    completed ? "text-slate-400 line-through" : "text-slate-900 dark:text-slate-100"
                                )}>
                                    {title}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {task.status === 'assigned' && (
                                    <div className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 animate-pulse">
                                        Assigned
                                    </div>
                                )}
                                {task.submissionStatus && (
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                        task.submissionStatus === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        task.submissionStatus === 'rejected' ? "bg-red-50 text-red-600 border-red-100" :
                                        "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {task.submissionStatus}
                                    </div>
                                )}
                                <div className={cn(
                                    "badge shrink-0",
                                    priority === 'high' ? "badge-danger" :
                                        priority === 'medium' ? "badge-warning" : "badge-success"
                                )}>
                                    <AlertCircle size={10} strokeWidth={3} />
                                    {priority}
                                </div>
                            </div>
                        </div>

                        {description && (
                            <p className={cn(
                                "text-sm line-clamp-2 mb-4 font-medium leading-relaxed",
                                completed ? "text-slate-400" : "text-slate-500 dark:text-slate-400"
                            )}>
                                {description}
                            </p>
                        )}

                        {/* Metadata Footer */}
                        <div className="flex flex-wrap items-center gap-4">
                            {dueDate && (
                                <div className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                    !completed && new Date(dueDate) < new Date()
                                        ? "bg-red-50 text-red-600 border border-red-100"
                                        : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
                                )}>
                                    <Clock size={12} strokeWidth={3} />
                                    {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                            )}

                            {(task.targetDate || task.targetTime) && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider border border-orange-100 dark:border-orange-900/30">
                                    <Target size={12} strokeWidth={3} />
                                    Target: {task.targetDate ? new Date(task.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} {task.targetTime || ''}
                                </div>
                            )}

                            {task.taskType && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-wider border border-purple-100 dark:border-purple-900/30">
                                    <Tag size={12} strokeWidth={3} />
                                    {task.taskType}
                                </div>
                            )}


                            {task.assignedToUserId && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/30">
                                        <CheckCircle2 size={12} strokeWidth={3} />
                                        To: {task.assignedToUserId?.name || 'Student'}
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const uId = task.assignedToUserId._id || task.assignedToUserId.id;
                                            const uName = task.assignedToUserId.name;
                                            navigate(`/messages?userId=${uId}&userName=${encodeURIComponent(uName)}`);
                                        }}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-[10px] font-black uppercase tracking-widest transition-colors border border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow"
                                        title="Direct Message"
                                    >
                                        <MessageSquare size={12} strokeWidth={3} />
                                        Chat
                                    </button>
                                </div>
                            )}

                            {task.assignedByUserId && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-100 dark:border-amber-900/30">
                                        <Edit3 size={12} strokeWidth={3} />
                                        By: {task.assignedByUserId?.name || 'Mentor'}
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const uId = task.assignedByUserId._id || task.assignedByUserId.id;
                                            const uName = task.assignedByUserId.name;
                                            navigate(`/messages?userId=${uId}&userName=${encodeURIComponent(uName)}`);
                                        }}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-[10px] font-black uppercase tracking-widest transition-colors border border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow"
                                        title="Direct Message"
                                    >
                                        <MessageSquare size={12} strokeWidth={3} />
                                        Chat
                                    </button>
                                </div>
                            )}

                            {task.documentationUrl && (
                                <a
                                    href={task.documentationUrl.startsWith('http') ? task.documentationUrl : `https://${task.documentationUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 transition-colors"
                                >
                                    <ExternalLink size={12} strokeWidth={3} />
                                    Docs
                                </a>
                            )}

                            {subtasks?.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <ListTodo size={12} strokeWidth={3} />
                                    {subtasks.filter(s => s.completed).length}/{subtasks.length}
                                </div>
                            )}



                            {/* Actions Menu */}
                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    ref={menuButtonRef}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const rect = menuButtonRef.current?.getBoundingClientRect();
                                        setAnchorRect(rect);
                                        setIsMenuOpen(!isMenuOpen);
                                    }}
                                    className={cn(
                                        "p-2 rounded-xl transition-all duration-300",
                                        isMenuOpen
                                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                            : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                    )}
                                >
                                    <MoreVertical size={16} />
                                </button>
                                <TaskActionMenu
                                    isOpen={isMenuOpen}
                                    onClose={() => setIsMenuOpen(false)}
                                    task={task}
                                    anchorRect={anchorRect}
                                    onAction={(actionId) => {
                                        setIsMenuOpen(false);
                                        onAction?.(actionId, task);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(TaskCard);
