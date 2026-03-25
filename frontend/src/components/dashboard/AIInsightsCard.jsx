import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Loader2, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const AIInsightsCard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        score: 0,
        insights: [],
        stats: {}
    });

    useEffect(() => {
        const fetchAIScore = async () => {
            if (!user) return;
            try {
                const res = await api.get(`/ai/productivity/${user.id || user._id}`);
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch AI score:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAIScore();
        const interval = setInterval(fetchAIScore, 45000);
        return () => clearInterval(interval);
    }, [user]);

    if (loading) {
        return (
            <div className="saas-card p-12 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Processing Analysis...</p>
            </div>
        );
    }

    return (
        <div className="saas-card overflow-hidden group">
            <div className="p-8 relative">
                {/* Background Sparkle Effect */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px] -mr-48 -mt-48 transition-colors duration-700" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Section: Core Message */}
                    <div className="lg:col-span-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 saas-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <Sparkles size={22} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Productivity Pulse</h2>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mt-1">AI Engine v2.0</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight">
                                    {data.score > 70 ? "Excellent momentum. You're outperforming 90% of peers." :
                                        data.score > 40 ? "Steady progress. Focus on high-priority items to scale." :
                                            "Optimization required. Start with small, manageable tasks."}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                                    {data.insights?.[0]?.message || "Start tracking sessions to activate deep insights."}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Status</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${data.score > 70 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {data.score > 70 ? 'High Performance' : 'Consistent Flow'}
                                    </span>
                                </div>
                            </div>
                            <button className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors">
                                <ArrowUpRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Middle: Score Visualization */}
                    <div className="lg:col-span-4 flex items-center justify-center">
                        <div className="relative group/score">
                            {/* Score Circle */}
                            <svg className="w-56 h-56 -rotate-90">
                                <circle
                                    cx="112" cy="112" r="100"
                                    className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                                    strokeWidth="12"
                                />
                                <motion.circle
                                    cx="112" cy="112" r="100"
                                    className="fill-none"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="12"
                                    strokeDasharray="628.3"
                                    initial={{ strokeDashoffset: 628.3 }}
                                    animate={{ strokeDashoffset: 628.3 - (628.3 * data.score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="50%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                    {Math.round(data.score)}
                                </span>
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[.25em] mt-2">Score Index</span>
                            </div>
                            {/* Decorative dots */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800" />
                        </div>
                    </div>

                    {/* Right: Detailed Insights */}
                    <div className="lg:col-span-4 space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">System Observations</h3>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {data.insights && data.insights.length > 0 ? (
                                    data.insights.slice(0, 3).map((insight, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + (idx * 0.1) }}
                                            className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 saas-shadow transition-all hover:border-blue-500/30"
                                        >
                                            <div className={cn(
                                                "p-2 rounded-xl mt-0.5",
                                                insight.type === 'warning' ? "bg-amber-500/10 text-amber-500" :
                                                    insight.type === 'success' ? "bg-emerald-500/10 text-emerald-500" :
                                                        "bg-blue-500/10 text-blue-500"
                                            )}>
                                                {insight.type === 'warning' ? <AlertTriangle size={16} /> :
                                                    insight.type === 'success' ? <CheckCircle size={16} /> :
                                                        <TrendingUp size={16} />}
                                            </div>
                                            <p className="text-xs font-bold leading-relaxed text-slate-700 dark:text-slate-300">
                                                {insight.message}
                                            </p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <p className="text-xs text-slate-400 font-bold italic uppercase tracking-widest">Awaiting Data Streams...</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInsightsCard;

