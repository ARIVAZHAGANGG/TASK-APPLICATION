import { Users, LayoutDashboard, ListTodo, CheckCircle, BarChart, Loader2, ArrowUpRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import CalendarPopup from "../components/dashboard/CalendarPopup";
import bitLogo from "../assets/logo.png";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [staffActivity, setStaffActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarAnchor, setCalendarAnchor] = useState(null);
    const calendarBtnRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activityRes] = await Promise.all([
                    api.get("/tasks/admin-stats"),
                    api.get("/admin/activity")
                ]);
                setStats(statsRes.data);
                setStaffActivity(activityRes.data);
            } catch (error) {
                toast.error("Failed to load admin dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary-500" size={48} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-vibrant-single p-6 sm:p-8 rounded-[32px] lg:rounded-[40px] border border-white/20 shadow-2xl relative overflow-hidden group">
                {/* Background Glass Overlay */}
                <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-md" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10 w-full justify-between">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex items-center justify-center p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-xl shadow-2xl border border-white/40 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 ease-out">
                            <span className="text-2xl sm:text-4xl font-black text-white tracking-tighter drop-shadow-md">BIT</span>
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none uppercase drop-shadow-lg">
                                Control Center
                            </h1>
                            <div className="flex items-center gap-3 mt-3 bg-black/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.9)]"></div>
                                <p className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-[0.2em]">System Intelligence Hub</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 w-full sm:w-auto mt-4 sm:mt-0 relative z-10">
                        <div className="flex flex-col items-center sm:items-end flex-1 sm:flex-none">
                            <div className="bg-black/20 backdrop-blur-xl px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center sm:items-end transition-all hover:bg-black/30 w-full sm:w-auto">
                                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tighter leading-none drop-shadow-md">
                                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-bold text-yellow-300 uppercase tracking-widest mt-1.5 drop-shadow-sm whitespace-nowrap">
                                    {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
                            <div 
                                ref={calendarBtnRef}
                                onClick={() => {
                                    const rect = calendarBtnRef.current?.getBoundingClientRect();
                                    setCalendarAnchor(rect);
                                    setIsCalendarOpen(true);
                                }}
                                className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-2xl transform hover:scale-105 transition-all cursor-pointer border border-white/30 shrink-0"
                            >
                                <Calendar size={20} className="sm:hidden" />
                                <Calendar size={24} className="hidden sm:block" />
                            </div>
                            
                            <button 
                                onClick={() => navigate("/report")}
                                className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-slate-900 font-black rounded-xl sm:rounded-2xl shadow-2xl hover:bg-slate-100 transition-all transform active:scale-95 uppercase text-[10px] sm:text-xs tracking-widest shrink-0"
                            >
                                Get Report
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Global Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {[
                    { label: "Total Missions", value: stats?.globalStats?.totalTasks || 0, icon: ListTodo, color: "blue", gradient: "from-blue-600 via-blue-500 to-indigo-600" },
                    { label: "Completed", value: stats?.globalStats?.completedTasks || 0, icon: CheckCircle, color: "emerald", gradient: "from-emerald-500 via-teal-500 to-green-600" },
                    { label: "Success Rate", value: `${Math.round((stats?.globalStats?.completedTasks / stats?.globalStats?.totalTasks) * 100 || 0)}%`, icon: BarChart, color: "purple", gradient: "from-purple-600 via-violet-600 to-indigo-600" },
                    { label: "Active Staff", value: staffActivity.length, icon: Users, color: "amber", gradient: "from-amber-500 via-orange-500 to-rose-500" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[24px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-500"
                    >
                        <div className={cn(
                            "absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 blur-[40px] sm:blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 transition-all group-hover:opacity-40",
                            `bg-${stat.color}-500`
                        )} />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={cn(
                                "p-3 sm:p-4 rounded-xl sm:rounded-2xl text-white shadow-2xl transform group-hover:rotate-6 transition-transform duration-500",
                                `bg-gradient-to-br ${stat.gradient}`
                            )}>
                                <stat.icon size={20} className="sm:hidden" />
                                <stat.icon size={24} className="hidden sm:block" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Staff Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-6 sm:mb-8 uppercase tracking-widest text-sm flex items-center gap-3">
                            <Users size={18} className="text-primary-500" /> Staff Activity Monitor
                        </h2>
                        
                        <div className="space-y-6">
                            {staffActivity.length > 0 ? staffActivity.map((staff, i) => (
                                <div key={i} className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all">
                                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20 flex items-center justify-center font-black text-white text-lg sm:text-xl">
                                                {staff.staffName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs sm:text-sm tracking-tight truncate max-w-[120px] sm:max-w-none">{staff.staffName}</h3>
                                                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ID: {staff.staffId}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tighter">{staff.taskCount}</p>
                                            <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployments</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <p className="text-lg sm:text-xl font-black text-green-500">{staff.completedTasks}</p>
                                            <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Succeeded</p>
                                        </div>
                                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <p className="text-lg sm:text-xl font-black text-blue-500">{Math.round((staff.completedTasks / staff.taskCount) * 100 || 0)}%</p>
                                            <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center py-12 text-slate-500 uppercase text-xs font-black tracking-widest italic">No staff activity recorded</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6 mt-6 lg:mt-0">
                    <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-2xl relative overflow-hidden transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <h2 className="text-base sm:text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-white">
                           <LayoutDashboard size={18} className="text-primary-400" /> Productivity
                        </h2>
                        
                        <div className="space-y-4 sm:space-y-6">
                            {(stats?.topProductiveUsers || []).map((user, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs sm:text-sm font-black text-slate-400 group-hover:text-primary-400 transition-colors uppercase w-4">{i + 1}</span>
                                        <p className="text-xs sm:text-sm font-bold truncate max-w-[100px] sm:max-w-[120px]">{user.userName}</p>
                                    </div>
                                    <span className="text-[9px] sm:text-xs font-black bg-white/10 px-2 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap">
                                        {user.completedCount} Missions
                                    </span>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => navigate("/analytics")}
                            className="w-full mt-8 sm:mt-10 py-3 sm:py-4 bg-primary-500 text-slate-900 font-black uppercase text-[10px] sm:text-xs tracking-widest rounded-xl sm:rounded-2xl hover:bg-white transition-all transform active:scale-95 shadow-lg shadow-primary-500/20"
                        >
                            Full Analytics
                        </button>
                    </div>
                </div>
            </div>
            <CalendarPopup 
                isOpen={isCalendarOpen} 
                onClose={() => setIsCalendarOpen(false)} 
                anchorRect={calendarAnchor}
            />
        </div>
    );
};

export default AdminDashboard;
