import React, { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from "recharts";
import { motion } from "framer-motion";
import { AlertTriangle, Info, CheckCircle, TrendingUp, Zap } from "lucide-react";
import { cn } from "../../utils/cn";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-3xl border border-white/60 dark:border-slate-800/80 p-4 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label || 'Metric Details'}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: entry.color || entry.payload.fill || '#6366f1' }} />
                        <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                            {entry.value} <span className="text-[10px] opacity-60 uppercase font-black">{entry.name}</span>
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const AnalyticsCharts = ({ weeklyData, priorityData, trendData }) => {
    const [viewType, setViewType] = useState('area');
    const TOTAL_UNITS = priorityData?.reduce((acc, curr) => acc + curr.value, 0) || 0;

    return (
        <div className="flex flex-col gap-12">
            {/* Holographic Header Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-1">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={16} className="text-indigo-600 fill-indigo-600 animate-pulse" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Holographic <span className="text-indigo-600">Sync</span></h3>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Intelligence Protocol v2.0</p>
                </div>
                
                <div className="flex items-center p-1.5 bg-white/50 dark:bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-white/40 dark:border-slate-800/60 shadow-xl w-fit self-end md:self-auto">
                    <button 
                        onClick={() => setViewType('bar')}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                            viewType === 'bar' ? "bg-indigo-600 text-white shadow-lg active:scale-95" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Granular Mode
                    </button>
                    <button 
                        onClick={() => setViewType('area')}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                            viewType === 'area' ? "bg-indigo-600 text-white shadow-lg active:scale-95" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Fluid Stream
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Velocity Visualization */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="saas-card overflow-hidden"
                >
                    <div className="p-8 pb-0">
                        <div className="flex items-center gap-3 mb-1">
                            <TrendingUp size={16} className="text-indigo-500" />
                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Mission Velocity</h4>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Real-time throughput analysis</p>
                    </div>
                    
                    <div className="h-80 w-full px-4 pb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            {viewType === 'bar' ? (
                                <BarChart data={weeklyData}>
                                    <defs>
                                        <linearGradient id="velocityBarGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#4338ca" stopOpacity={0.7} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border-color)" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--text-tertiary)", fontWeight: 900 }} dy={12} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--text-tertiary)", fontWeight: 900 }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)', radius: 12 }} />
                                    <Bar dataKey="tasks" name="Missions" fill="url(#velocityBarGradient)" radius={[8, 8, 8, 8]} barSize={14} animationDuration={800} />
                                </BarChart>
                            ) : (
                                <AreaChart data={weeklyData}>
                                    <defs>
                                        <linearGradient id="velocityAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border-color)" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--text-tertiary)", fontWeight: 900 }} dy={12} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--text-tertiary)", fontWeight: 900 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="tasks" name="Missions" stroke="#6366f1" strokeWidth={5} fill="url(#velocityAreaGradient)" animationDuration={800} strokeLinecap="round" />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Consistency Analysis */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="saas-card overflow-hidden"
                >
                    <div className="p-8 pb-0">
                        <div className="flex items-center gap-3 mb-1">
                            <CheckCircle size={16} className="text-emerald-500" />
                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Efficiency Protocol</h4>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Consistency benchmark scan</p>
                    </div>
                    
                    <div className="h-80 w-full px-4 pb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border-color)" opacity={0.2} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--text-tertiary)", fontWeight: 900 }} dy={12} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--text-tertiary)", fontWeight: 900 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="completed" name="Success Rate" stroke="#10b981" strokeWidth={5} fill="url(#efficiencyGradient)" animationDuration={1000} strokeLinecap="round" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Holographic Priority Donut Redesign */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="saas-card p-1 lg:col-span-2 overflow-hidden"
                >
                    <div className="p-8 border-b border-white/40 dark:border-slate-800/40">
                        <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-1">Resource Priority Scan</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Holographic allocation distribution</p>
                    </div>

                    <div className="flex flex-col xl:flex-row items-center justify-around py-12 px-8 gap-12">
                        {/* The Holographic Ring */}
                        <div className="h-[340px] w-full xl:w-1/2 relative group">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        <linearGradient id="hologramHigh" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#f43f5e" />
                                            <stop offset="100%" stopColor="#9f1239" />
                                        </linearGradient>
                                        <linearGradient id="hologramMedium" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#fbbf24" />
                                            <stop offset="100%" stopColor="#d97706" />
                                        </linearGradient>
                                        <linearGradient id="hologramLow" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#34d399" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                        <filter id="hologramGlow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="8" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>
                                    <Pie
                                        data={priorityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={110}
                                        outerRadius={145}
                                        paddingAngle={12}
                                        cornerRadius={16}
                                        dataKey="value"
                                        stroke="none"
                                        animationBegin={100}
                                        animationDuration={800}
                                        animationEasing="ease-out"
                                    >
                                        {priorityData?.map((entry, index) => {
                                            let gradient = "url(#hologramMedium)";
                                            if (entry.name === "High") gradient = "url(#hologramHigh)";
                                            if (entry.name === "Low") gradient = "url(#hologramLow)";
                                            return <Cell key={`hologram-cell-${index}`} fill={gradient} className="outline-none cursor-pointer" />;
                                        })}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            
                            {/* Center Core */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="absolute w-44 h-44 bg-indigo-500/5 blur-xl rounded-full" />
                                <motion.span 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none relative z-10"
                                >
                                    {TOTAL_UNITS}
                                </motion.span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4 relative z-10">Intel Units</span>
                            </div>
                        </div>

                        {/* Snappy Legend Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-6 w-full xl:w-[420px]">
                            {priorityData?.map((item, index) => {
                                let icon = <Info size={18} className="text-amber-500" />;
                                let bgStyle = "bg-amber-500/5 dark:bg-amber-500/5";
                                let barColor = "bg-amber-500";

                                if (item.name === "High") {
                                    icon = <AlertTriangle size={18} className="text-rose-500" />;
                                    bgStyle = "bg-rose-500/5 dark:bg-rose-500/5";
                                    barColor = "bg-rose-500";
                                } else if (item.name === "Low") {
                                    icon = <CheckCircle size={18} className="text-emerald-500" />;
                                    bgStyle = "bg-emerald-500/5 dark:bg-emerald-500/5";
                                    barColor = "bg-emerald-500";
                                }

                                const percentage = TOTAL_UNITS > 0 ? Math.round((item.value / TOTAL_UNITS) * 100) : 0;

                                return (
                                    <motion.div 
                                        key={`hologram-legend-${item.name}`} 
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        transition={{ duration: 0.2 }}
                                        className={cn(
                                            "relative p-6 rounded-[32px] backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all group",
                                            bgStyle
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-2xl shadow-inner border border-white/20 dark:border-slate-800/40">
                                                    {icon}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block leading-none mb-1.5">{item.name} Protocol</span>
                                                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{item.value} <span className="text-[11px] opacity-40 ml-1 font-bold italic">Units</span></span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{percentage}%</span>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Share</p>
                                            </div>
                                        </div>
                                        {/* Precision Progress Bar */}
                                        <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800/40 rounded-full overflow-hidden border border-white/10 dark:border-slate-700/20">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${percentage}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                                className={cn("h-full rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)]", barColor)}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
