import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { LayoutDashboard, CheckCircle2, Clock, TrendingUp, Calendar, Zap, Activity, Sun, Users } from "lucide-react";
import api from "../services/api";
import StatsCard from "../components/dashboard/StatsCard";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import TaskCard from "../components/ui/TaskCard";
import TaskModal from "../components/ui/TaskModal";
import CalendarPopup from "../components/dashboard/CalendarPopup";
import { cn } from "../utils/cn";

const Dashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarAnchor, setCalendarAnchor] = useState(null);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Task Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalTab, setModalTab] = useState("details");
    const calendarBtnRef = useRef(null);



    const fetchDashboardData = useCallback(async () => {
        try {
            const [statsRes, tasksRes] = await Promise.all([
                api.get("/tasks/stats"),
                api.get("/tasks")
            ]);
            setStats(statsRes.data);

            // Filter tasks assigned to me
            const allTasks = tasksRes.data.data || tasksRes.data;
            const assigned = allTasks.filter(t => t.assignedToUserId && (t.assignedToUserId === user.id || t.assignedToUserId?._id === user.id));
            setAssignedTasks(assigned);
        } catch (err) {
            toast.error("Failed to load dashboard analytics");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleAction = useCallback(async (actionId, task) => {
        const taskId = task.id || task._id;

        switch (actionId) {
            case 'toggleComplete':
                try {
                    const updatedStatus = !task.completed;
                    setAssignedTasks(prev => prev.map(t => (t.id || t._id) === taskId ? { ...t, completed: updatedStatus } : t));
                    await api.put(`/tasks/${taskId}`, { completed: updatedStatus });
                    toast.success(updatedStatus ? "Mission completed! 🚀" : "Marked as pending");
                    fetchDashboardData(); // Refresh stats
                } catch (error) {
                    toast.error("Action failed");
                    fetchDashboardData();
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
            default:
                break;
        }
    }, [fetchDashboardData]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing Control Center...</p>
            </div>
        );
    }



    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 max-w-[1600px] mx-auto transition-colors duration-300 relative z-10 min-h-screen"
        >
            {/* Immersive Background Fragments */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className={cn(
                    "absolute -top-[10%] -left-[10%] w-[40%] h-[40%] blur-[120px] opacity-[0.15] dark:opacity-[0.1] rounded-full",
                    user?.role === 'admin' ? "bg-rose-500" : user?.role === 'mentor' ? "bg-indigo-500" : "bg-blue-500"
                )} />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] blur-[100px] opacity-[0.12] dark:opacity-[0.08] bg-purple-500 rounded-full" />
                <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] blur-[110px] opacity-[0.1] dark:opacity-[0.05] bg-emerald-500 rounded-full" />
            </div>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-vibrant-single p-8 rounded-[40px] border border-white/20 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                {/* Background Glass Overlay */}
                <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-md" />
                
                <div className="flex items-center gap-6 relative z-10 w-full justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center justify-center p-4 rounded-3xl bg-white/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/40 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 ease-out">
                            <span className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">BIT</span>
                        </div>
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tight leading-none uppercase drop-shadow-lg">Personal Hub</h1>
                            <div className="flex items-center gap-3 mt-3 bg-black/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-inner">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_12px_rgba(74,222,128,0.9)]"></div>
                                <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Active Operative: {user?.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="flex flex-col items-end">
                            <div className="bg-black/20 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-end group/clock transition-all hover:bg-black/30">
                                <span className="text-3xl font-black text-white font-mono tracking-tighter leading-none drop-shadow-md">
                                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                </span>
                                <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest mt-1.5 drop-shadow-sm group-hover:text-yellow-200 transition-colors">
                                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                        <div 
                            ref={calendarBtnRef}
                            onClick={() => {
                                const rect = calendarBtnRef.current?.getBoundingClientRect();
                                setCalendarAnchor(rect);
                                setIsCalendarOpen(true);
                            }}
                            className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-rose-600 rounded-2xl flex items-center justify-center text-white shadow-2xl transform hover:scale-110 hover:-rotate-6 transition-all duration-300 cursor-pointer group/cal border border-white/30"
                        >
                            <Calendar size={28} className="drop-shadow-md" />
                            <div className="absolute top-full mt-3 bg-slate-900/90 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white tracking-[0.2em] opacity-0 group-hover/cal:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap pointer-events-none shadow-2xl">
                                Show Calendar
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mb-12" />

            <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                        <LayoutDashboard size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">System <span className="text-blue-600 dark:text-blue-400 font-medium">Overview</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">Your productivity mission, visualized in real-time.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatsCard title="Total Objectives" value={stats?.totalTasks || 0} icon={Zap} color="primary" index={0} />
                    <StatsCard
                        title="Successful Completion"
                        value={stats?.completedTasks || 0}
                        icon={CheckCircle2}
                        color="success"
                        index={1}
                    />
                    <StatsCard title="Active Operations" value={stats?.pendingTasks || 0} icon={Activity} color="warning" index={2} />
                    {user?.role === 'mentor' ? (
                        <StatsCard 
                            title="Objectives Deployed" 
                            value="View List" 
                            icon={Users} 
                            color="indigo" 
                            index={3} 
                            onClick={() => navigate("/assigned-tasks")}
                            className="cursor-pointer"
                        />
                    ) : (
                        <StatsCard
                            title="Efficiency Index"
                            value={stats?.completedPercentage ? `${Math.round(stats.completedPercentage)}%` : "0%"}
                            icon={TrendingUp}
                            color="danger"
                            index={3}
                        />
                    )}
                </div>
            </div>

            {/* Assigned Tasks Section for Mentors and Students */}
            {(user?.role === 'mentor' || user?.role === 'student') && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Assigned <span className="text-indigo-600 dark:text-indigo-400 font-medium">Missions</span></h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">Objectives delegated to you for execution.</p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            className="rounded-2xl text-xs font-black uppercase tracking-widest"
                            onClick={() => navigate(user?.role === 'student' ? '/board' : '/tasks')}
                        >
                            View All
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {assignedTasks.length > 0 ? (
                                assignedTasks.slice(0, 4).map((task) => (
                                    <TaskCard
                                        key={task.id || task._id}
                                        task={task}
                                        onAction={handleAction}
                                    />
                                ))
                            ) : (
                                <div className="lg:col-span-2 p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No assigned missions found in records.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}




            <CalendarPopup 
                isOpen={isCalendarOpen} 
                onClose={() => setIsCalendarOpen(false)} 
                anchorRect={calendarAnchor}
            />
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchDashboardData}
                task={selectedTask}
                initialTab={modalTab}
            />
        </motion.div>
    );
};

export default Dashboard;
