import React, { useState, useEffect } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    isToday,
    parseISO
} from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    Clock,
    Sparkles,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import TaskModal from '../components/ui/TaskModal';
import api from '../services/api';
import { cn } from '../utils/cn';
import { toast } from 'sonner';

const CalendarView = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [filteredTasksSummary, setFilteredTasksSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewMode, setViewMode] = useState('monthly');

    // Safe date parsing helper
    const safeParseISO = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return new Date(0);
        try {
            return parseISO(dateStr);
        } catch (e) {
            return new Date(0);
        }
    };

    useEffect(() => {
        fetchTasks();
        window.addEventListener('refresh-tasks', fetchTasks);
        return () => window.removeEventListener('refresh-tasks', fetchTasks);
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            const taskData = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setTasks(taskData);
        } catch (err) {
            console.error("Failed to load tasks for calendar");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setFilteredTasksSummary(tasks);
    }, [tasks]);

    const handleCreateTask = async (formData) => {
        try {
            if (Array.isArray(formData)) {
                await Promise.all(formData.map(data => api.post("/tasks", data)));
                toast.success(`${formData.length} missions scheduled`);
            } else {
                await api.post("/tasks", formData);
                toast.success("New mission scheduled");
            }
            setIsTaskModalOpen(false);
            fetchTasks();
            window.dispatchEvent(new CustomEvent("refresh-tasks"));
        } catch (error) {
            toast.error("Failed to schedule mission");
        }
    };

    const openCreateModal = (date = null) => {
        if (date) {
            // Set selected date for the modal
            setSelectedDate(date);
        } else {
            setSelectedDate(null);
        }
        setIsTaskModalOpen(true);
    };

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[22px] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center p-2.5 transition-all hover:shadow-xl hover:shadow-blue-500/10">
                        <img src="/assets/logo.png" alt="BIT Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
                            {tasks.filter(t => t.dueDate && isSameMonth(safeParseISO(t.dueDate), currentMonth)).length} Missions in Registry
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all text-slate-600 dark:text-slate-400"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-4 py-2 text-xs font-black uppercase text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all text-slate-600 dark:text-slate-400"
                    >
                        <ChevronRight size={20} />
                    </button>

                    <div className="w-px h-5 bg-slate-100 dark:bg-slate-800 hidden sm:block mx-1"></div>

                    <div className="flex p-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                viewMode === 'monthly' ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setViewMode('weekly')}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                viewMode === 'weekly' ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Weekly
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map(day => (
                    <div key={day} className="text-center py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderWeeklyCells = () => {
        const startDate = startOfWeek(currentMonth);
        const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

        return (
            <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/5 bg-white dark:bg-slate-900/40">
                {days.map((day, i) => {
                    const dayTasks = tasks.filter(task =>
                        task.dueDate && isSameDay(safeParseISO(task.dueDate), day)
                    );

                    return (
                        <div
                            key={i}
                            onClick={() => openCreateModal(day)}
                            className={cn(
                                "min-h-[450px] p-5 border-r border-b border-slate-100 dark:border-slate-800 transition-all cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 relative group",
                                isToday(day) && "bg-rose-50/20 dark:bg-rose-900/5 shadow-inner"
                            )}
                        >
                            {isToday(day) && <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.4)]" />}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{format(day, 'EEE')}</span>
                                    <span className={cn(
                                        "text-xl font-black w-10 h-10 flex items-center justify-center rounded-xl",
                                        isToday(day) ? "bg-rose-600 text-white shadow-lg shadow-rose-500/30" : "text-slate-700 dark:text-slate-200"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                {isToday(day) && <Sparkles size={16} className="text-rose-500 animate-pulse" />}
                            </div>

                            <div className="space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={cn(
                                            "p-3 rounded-xl text-xs font-bold border flex flex-col gap-2",
                                            task.completed
                                                ? "bg-slate-100 text-slate-400 border-slate-200"
                                                : task.priority === 'high'
                                                    ? "bg-rose-50 text-rose-600 border-rose-100 shadow-sm"
                                                    : "bg-blue-50 text-blue-600 border-blue-100 shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                task.priority === 'high' ? "bg-rose-500" : "bg-blue-500"
                                            )} />
                                            <span className={cn("truncate", task.completed && "line-through")}>{task.title}</span>
                                        </div>
                                        <div className="flex items-center justify-end opacity-60">
                                            <Clock size={10} />
                                        </div>
                                    </div>
                                ))}
                                {dayTasks.length === 0 && (
                                    <div className="h-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center opacity-20">
                                        <Plus size={16} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const days = eachDayOfInterval({
            start: startDate,
            end: endDate,
        });

        return (
            <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/5 bg-white dark:bg-slate-900/40">
                {days.map((day, i) => {
                    const dayTasks = tasks.filter(task =>
                        task.dueDate && isSameDay(safeParseISO(task.dueDate), day)
                    );

                    return (
                        <div
                            key={i}
                            onClick={() => openCreateModal(day)}
                            className={cn(
                                "min-h-[160px] p-4 border-r border-b border-slate-100 dark:border-slate-800 transition-all cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 relative group",
                                !isSameMonth(day, monthStart) ? "bg-slate-50/20 dark:bg-slate-900/20 text-slate-300 dark:text-slate-700" : "text-slate-700 dark:text-slate-200",
                                isToday(day) && "bg-blue-50/20 dark:bg-blue-900/5"
                            )}
                        >
                            {isToday(day) && <div className="absolute top-0 left-0 right-0 h-1 bg-primary-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]" />}
                            <div className="flex items-center justify-between mb-3">
                                <span className={cn(
                                    "text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg",
                                    isToday(day) ? "bg-rose-600 text-white shadow-lg shadow-rose-500/30" : ""
                                )}>
                                    {format(day, 'd')}
                                </span>
                                {isToday(day) && <Sparkles size={12} className="text-rose-500 animate-pulse" />}
                            </div>

                            <div className="space-y-1.5 overflow-y-auto max-h-[100px] custom-scrollbar-hide">
                                {dayTasks
                                    .map(task => (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "px-2 py-1 rounded-lg text-[10px] font-bold border truncate flex items-center gap-1.5 shadow-sm",
                                                task.completed
                                                    ? "bg-slate-100 text-slate-400 border-slate-200 line-through"
                                                    : "bg-blue-50 text-blue-600 border-blue-100"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-1 h-1 rounded-full shrink-0",
                                                task.priority === 'high' ? "bg-rose-500" : "bg-blue-500"
                                            )} />
                                            {task.title}
                                        </div>
                                    ))}
                            </div>

                            {!isSameMonth(day, monthStart) && dayTasks.length > 0 && (
                                <div className="mt-1">
                                    <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto animate-slide-up h-full flex flex-col gap-8">
            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                {/* Main Calendar Section */}
                <div className="flex-1 saas-card p-10 bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50 shadow-2xl flex flex-col">
                    {renderHeader()}
                    {renderDays()}
                    <div className="flex-1">
                        {viewMode === 'monthly' ? renderCells() : renderWeeklyCells()}
                    </div>
                </div>

                {/* Right Side Agenda Panel */}
                <div className="w-full lg:w-96 flex flex-col gap-6">
                    <div className="saas-card p-8 bg-rose-950/90 dark:bg-rose-950 border-none relative overflow-hidden group h-fit">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full -mr-16 -mt-16 blur-2xl font-bold" />
                        <div className="relative z-10">
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-rose-50 flex items-center gap-3 mb-1">
                                    <Sparkles className="text-rose-400" size={20} />
                                    Today's Agenda
                                </h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-rose-300 text-[10px] font-bold uppercase tracking-widest">
                                        {format(new Date(), 'EEEE, d MMMM yyyy')}
                                    </p>
                                    <div className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm">
                                        {filteredTasksSummary.filter(t => t.dueDate && isSameDay(safeParseISO(t.dueDate), new Date())).length} Tasks
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar-hide">
                                {filteredTasksSummary.filter(t => t.dueDate && isSameDay(safeParseISO(t.dueDate), new Date())).length > 0 ? (
                                    filteredTasksSummary.filter(t => t.dueDate && isSameDay(safeParseISO(t.dueDate), new Date())).map(task => (
                                        <div key={task.id} className="p-4 bg-white/10 rounded-2xl border border-white/10 flex flex-col gap-2 hover:bg-white/20 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", task.priority === 'high' ? "bg-rose-400" : "bg-blue-400")} />
                                                <span className="text-white font-bold text-sm truncate">{task.title}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-rose-200 font-bold uppercase tracking-widest">
                                                <span>Mission</span>
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        {task.dueDate && <span className="text-rose-100">{format(safeParseISO(task.dueDate), 'HH:mm')}</span>}
                                                        <span className="text-rose-400 mx-0.5">-</span>
                                                        {task.dueDate && (
                                                            <span className="text-emerald-400">
                                                                {format(new Date(safeParseISO(task.dueDate).getTime() + (task.estimatedTime || 60) * 60000), 'HH:mm')}
                                                            </span>
                                                        )}
                                                        <Clock size={10} className="text-rose-200 ml-1" />
                                                    </div>
                                                    {task.createdAt && (
                                                        <span className="text-[8px] text-slate-500 font-medium lowercase">
                                                            created {format(safeParseISO(task.createdAt), 'HH:mm')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center">
                                        <p className="text-rose-300 font-bold text-xs uppercase tracking-widest">No missions today</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => openCreateModal(new Date())}
                                className="w-full mt-6 py-4 bg-white text-rose-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-rose-50 active:scale-95 transition-all"
                            >
                                Add Today's Goal
                            </button>
                        </div>
                    </div>


                    <div className="saas-card p-8 bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 uppercase tracking-widest text-xs">Mission Intel</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Active</span>
                                <span className="text-xl font-black text-slate-900 dark:text-white">{filteredTasksSummary.filter(t => !t.completed).length}</span>
                            </div>
                            <div className="flex items-center justify-between font-medium">
                                <span className="text-rose-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle size={14} /> Overdue
                                </span>
                                <span className="text-xl font-black text-rose-600">{filteredTasksSummary.filter(t => t.dueDate && !t.completed && new Date(t.dueDate) < new Date()).length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-500" /> Done
                                </span>
                                <span className="text-xl font-black text-emerald-600">{filteredTasksSummary.filter(t => t.completed).length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleCreateTask}
                task={selectedDate ? { dueDate: selectedDate } : null}
            />
        </div>
    );
};

export default CalendarView;
