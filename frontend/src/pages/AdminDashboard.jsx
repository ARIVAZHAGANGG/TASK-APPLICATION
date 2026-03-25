import { Users, LayoutDashboard, ListTodo, CheckCircle, BarChart, Loader2, ArrowUpRight, Search, Calendar } from "lucide-react";
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
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-vibrant-single p-8 rounded-[40px] border border-white/20 shadow-2xl relative overflow-hidden group">
                {/* Background Glass Overlay */}
                <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-md" />
                
                <div className="flex items-center gap-6 relative z-10 w-full justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center justify-center p-4 rounded-3xl bg-white/20 backdrop-blur-xl shadow-2xl border border-white/40 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 ease-out">
                            <span className="text-4xl font-black text-white tracking-tighter drop-shadow-md">BIT</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight uppercase leading-none drop-shadow-lg">Command Center</h1>
                            <div className="flex items-center gap-3 mt-3 bg-black/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-inner">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.9)]"></div>
                                <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Institutional Intelligence</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col items-end">
                            <div className="bg-black/20 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-end transition-all hover:bg-black/30">
                                <span className="text-3xl font-black text-white font-mono tracking-tighter leading-none drop-shadow-md">
                                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                </span>
                                <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest mt-1.5 drop-shadow-sm">
                                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div 
                                ref={calendarBtnRef}
                                onClick={() => {
                                    const rect = calendarBtnRef.current?.getBoundingClientRect();
                                    setCalendarAnchor(rect);
                                    setIsCalendarOpen(true);
                                }}
                                className="w-16 h-16 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all cursor-pointer group/cal border border-white/30"
                            >
                                <Calendar size={28} className="drop-shadow-md" />
                            </div>
                            
                            <button className="p-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl text-white hover:bg-white/20 transition-all shadow-2xl transform hover:scale-110">
                                <Search size={24} />
                            </button>
                            <button 
                                onClick={() => navigate("/report")}
                                className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-2xl hover:bg-slate-100 transition-all transform active:scale-95 hover:scale-105 uppercase text-xs tracking-widest"
                            >
                                Report
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Missions", value: stats?.globalStats?.totalTasks || 0, icon: ListTodo, color: "blue", gradient: "from-blue-600 via-blue-500 to-indigo-600" },
                    { label: "Completed", value: stats?.globalStats?.completedTasks || 0, icon: CheckCircle, color: "emerald", gradient: "from-emerald-500 via-teal-500 to-green-600" },
                    { label: "Success Rate", value: `${Math.round((stats?.globalStats?.completedTasks / stats?.globalStats?.totalTasks) * 100 || 0)}%`, icon: BarChart, color: "purple", gradient: "from-purple-600 via-violet-600 to-indigo-600" },
                    { label: "Active Staff", value: staffActivity.length, icon: Users, color: "amber", gradient: "from-amber-500 via-orange-500 to-rose-500" },
                    { label: "Assigned Tasks", value: "View All", icon: ListTodo, color: "indigo", gradient: "from-indigo-600 to-blue-700", action: () => navigate("/assigned-tasks") },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        onClick={stat.action}
                        className={cn(
                            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group hover:border-blue-500/50 hover:-translate-y-2 transition-all duration-500",
                            stat.action && "cursor-pointer"
                        )}
                    >
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 transition-all group-hover:opacity-40",
                            `bg-${stat.color}-500`
                        )} />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={cn(
                                "p-4 rounded-2xl text-white shadow-2xl transform group-hover:rotate-6 transition-transform duration-500",
                                `bg-gradient-to-br ${stat.gradient}`
                            )}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Staff Activity */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-widest text-sm flex items-center gap-3">
                            <Users size={18} className="text-primary-500" /> Staff Activity Monitor
                        </h2>
                        
                        <div className="space-y-6">
                            {staffActivity.length > 0 ? staffActivity.map((staff, i) => (
                                <div key={i} className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20 flex items-center justify-center font-black text-white text-xl">
                                                {staff.staffName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{staff.staffName}</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ID: {staff.staffId}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">{staff.taskCount}</p>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployments</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                            <p className="text-xl font-black text-green-500">{staff.completedTasks}</p>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Succeeded</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                            <p className="text-xl font-black text-blue-500">{Math.round((staff.completedTasks / staff.taskCount) * 100 || 0)}%</p>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center py-12 text-slate-500 uppercase text-xs font-black tracking-widest italic">No staff activity recorded</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <h2 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-white">
                           <LayoutDashboard size={18} className="text-primary-400" /> Productivity
                        </h2>
                        
                        <div className="space-y-6">
                            {(stats?.topProductiveUsers || []).map((user, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-slate-400 group-hover:text-primary-400 transition-colors uppercase w-4">{i + 1}</span>
                                        <p className="text-sm font-bold truncate max-w-[120px]">{user.userName}</p>
                                    </div>
                                    <span className="text-xs font-black bg-white/10 px-2 py-1 rounded-lg uppercase tracking-widest">
                                        {user.completedCount} Missions
                                    </span>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => navigate("/analytics")}
                            className="w-full mt-10 py-4 bg-primary-500 text-slate-900 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white transition-all transform active:scale-95 shadow-lg shadow-primary-500/20"
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
