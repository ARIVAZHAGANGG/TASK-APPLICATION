import { useState, useEffect, useCallback } from 'react';
import {
    Clock, Play, Square, TrendingUp, Calendar, BarChart2,
    RefreshCw, ChevronDown, Timer, Zap, Activity,
    History, Briefcase, User, GraduationCap, Heart
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { toast } from 'sonner';

/* ── Helpers ─────────────────────────────────────────── */
const fmtMinutes = (mins) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const fmtSeconds = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/* ── Professional Design System ───────────────────────── */
const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const categoryMeta = {
    Work: { color: 'text-blue-600', bg: 'bg-blue-50', icon: Briefcase },
    Personal: { color: 'text-purple-600', bg: 'bg-purple-50', icon: User },
    Study: { color: 'text-amber-600', bg: 'bg-amber-50', icon: GraduationCap },
    Fitness: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Heart },
    default: { color: 'text-slate-600', bg: 'bg-slate-50', icon: Activity },
};

/* ── Professional Stat Card ───────────────────────────── */
const StatCard = ({ label, value, icon: Icon, colorClass, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="saas-card p-6 flex items-center gap-5 group"
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${colorClass}`}>
            <Icon size={26} strokeWidth={2} />
        </div>
        <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{value}</p>
        </div>
    </motion.div>
);

const TimeTracking = () => {
    const [summary, setSummary] = useState([]);
    const [totals, setTotals] = useState({ today: 0, week: 0, month: 0 });
    const [sessions, setSessions] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [loading, setLoading] = useState(true);

    /* Fetch time summary */
    const fetchSummary = useCallback(async () => {
        try {
            const res = await api.get('/billing/time-summary');
            setSummary(res.data.summary || []);
            setTotals(res.data.totals || { today: 0, week: 0, month: 0 });
        } catch (err) {
            console.error("Summary Sync Failure:", err);
        }
    }, []);

    /* Fetch recent sessions */
    const fetchSessions = useCallback(async () => {
        try {
            const res = await api.get('/tasks/timelogs');
            const logs = res.data.timeLogs || [];

            // Check for active timer
            const active = logs.find(l => !l.endTime);
            if (active) {
                setIsTracking(true);
                const tId = active.taskId?.id || active.taskId;
                setSelectedTaskId(tId);
                const startMs = new Date(active.startTime).getTime();
                setElapsed(Math.floor((Date.now() - startMs) / 1000));
            } else {
                setIsTracking(false);
            }

            setSessions(logs.filter(l => l.endTime).slice(0, 10));
        } catch (err) {
            console.error("Session Fetch Failure:", err);
        }
    }, []);

    /* Fetch user tasks for selector */
    const fetchTasks = useCallback(async () => {
        try {
            const res = await api.get('/tasks/user');
            setTasks(res.data || []);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchSummary(), fetchSessions(), fetchTasks()]);
            setLoading(false);
        };
        init();

        // Polling for updates
        const interval = setInterval(() => {
            fetchSummary();
            fetchSessions();
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchSummary, fetchSessions, fetchTasks]);

    /* Live elapsed timer */
    useEffect(() => {
        if (!isTracking) return;
        const interval = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => clearInterval(interval);
    }, [isTracking]);

    const handleStart = async () => {
        if (!selectedTaskId) { toast.error('Please select an objective first'); return; }
        try {
            await api.post(`/tasks/${selectedTaskId}/timer/start`);
            setIsTracking(true);
            setElapsed(0);
            toast.success('System Lock: Deep Focus Session Started ⚡');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start timer');
        }
    };

    const handleStop = async () => {
        if (!selectedTaskId) return;
        try {
            const res = await api.post(`/tasks/${selectedTaskId}/timer/stop`);
            setIsTracking(false);
            setElapsed(0);
            const duration = res.data.timeLog?.durationMinutes || 0;
            toast.success(`Session Success: Logged ${duration}m to objective`);
            await Promise.all([fetchSummary(), fetchSessions()]);
        } catch (err) {
            toast.error('Could not terminate session');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-indigo-500 animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Time Metrics...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        Time <span className="text-indigo-600">Analytics</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 ml-1 italic">
                        "Precision tracking for high-performance outcomes."
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Server Link</span>
                    </div>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    label="Operations Today"
                    value={fmtMinutes(totals.today)}
                    icon={Zap}
                    colorClass="bg-indigo-600 text-white"
                    index={0}
                />
                <StatCard
                    label="Weekly Velocity"
                    value={fmtMinutes(totals.week)}
                    icon={TrendingUp}
                    colorClass="bg-slate-900 dark:bg-white dark:text-slate-900 text-white"
                    index={1}
                />
                <StatCard
                    label="Monthly Horizon"
                    value={fmtMinutes(totals.month)}
                    icon={Calendar}
                    colorClass="bg-emerald-500 text-white"
                    index={2}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Timer Section */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="saas-card p-10 bg-slate-950 border-none relative overflow-hidden group min-h-[400px] flex flex-col justify-between"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10 flex items-center justify-between mb-12">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white leading-tight">Flow Timer</h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mt-1">Deep Work Mode</p>
                                </div>
                            </div>
                            {isTracking && (
                                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Tracking Live</span>
                                </div>
                            )}
                        </div>

                        <div className="relative z-10 text-center py-12">
                            <motion.p
                                key={elapsed}
                                initial={{ scale: 0.98, opacity: 0.8 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-8xl font-black text-white font-mono tracking-tighter tabular-nums"
                            >
                                {fmtSeconds(elapsed)}
                            </motion.p>
                            <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs mt-4">Elapsed Duration</p>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 mt-12 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
                            <div className="flex-1 w-full">
                                <div className="relative group/select">
                                    <select
                                        className="w-full bg-transparent text-white font-bold text-sm outline-none appearance-none cursor-pointer py-2 pl-2 pr-10"
                                        value={selectedTaskId}
                                        onChange={(e) => setSelectedTaskId(e.target.value)}
                                        disabled={isTracking}
                                    >
                                        <option value="" className="bg-slate-900">Select active objective...</option>
                                        {tasks.map(t => (
                                            <option key={t.id || t._id} value={t.id || t._id} className="bg-slate-900 text-white">
                                                {t.title}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {!isTracking ? (
                                    <button
                                        onClick={handleStart}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                                    >
                                        <Play size={20} fill="currentColor" />
                                        START SESSION
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStop}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-rose-600/20 active:scale-95"
                                    >
                                        <Square size={20} fill="currentColor" />
                                        TERMINATE
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Distribution Chart */}
                    <div className="saas-card p-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
                                <BarChart2 size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">Allocation Analysis</h3>
                        </div>

                        {summary.length > 0 ? (
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={summary}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={8}
                                            dataKey="totalMinutes"
                                            nameKey="taskTitle"
                                        >
                                            {summary.map((entry, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '20px',
                                                border: 'none',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                                padding: '12px 20px',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                <History size={48} strokeWidth={1} className="mb-4 opacity-20" />
                                <p className="text-sm font-bold opacity-60">Log time to activate visualization</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Recent History */}
                <div className="space-y-8">
                    <div className="saas-card p-8 min-h-[600px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300">
                                    <History size={18} />
                                </div>
                                <h4 className="font-black uppercase tracking-widest text-xs text-slate-500">Timeline</h4>
                            </div>
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">LAST 10 OPS</span>
                        </div>

                        <div className="flex-1 space-y-4">
                            {sessions.length > 0 ? sessions.map((session, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={session.id}
                                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[150px]">
                                                {session.taskId?.title || 'System Task'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                    <Timer size={10} className="text-slate-500" />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {new Date(session.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-indigo-600">{session.durationMinutes}m</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Tracked</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-30 text-slate-400 py-20">
                                    <Briefcase size={40} strokeWidth={1} />
                                    <p className="text-xs font-bold mt-4">History Clear</p>
                                </div>
                            )}
                        </div>

                        <button className="w-full mt-8 py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            View Full Archive
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeTracking;
