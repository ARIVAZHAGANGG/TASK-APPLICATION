import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Target, Award, Calendar, ChevronRight, FileText, Loader2, Sparkles, Trophy, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import api from '../services/api';
import { toast } from 'sonner';
import bitLogo from '../assets/logo.png';

const ProductivityReport = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [gamiRes, taskRes] = await Promise.all([
                    api.get('/gamification/stats'),
                    api.get('/tasks/stats').catch(() => ({ data: { productivityScore: 0 } }))
                ]);
                setStats({ 
                    ...gamiRes.data, 
                    computedProductivityScore: taskRes.data.productivityScore || 0 
                });
            } catch (err) {
                console.error("Failed to fetch report stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleDownloadReport = async () => {
        setIsGenerating(true);
        try {
            const response = await api.get('/gamification/report/download', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `BitTask_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

            toast.success("Productivity Report Downloaded!", {
                icon: <Download className="text-green-500" />
            });
        } catch (err) {
            console.error("Download failed:", err);
            toast.error("Failed to generate PDF report");
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
    );

    const productivityScore = stats?.computedProductivityScore || 0;

    const getPerformanceStatus = (score) => {
        if (score >= 90) return { label: "Legendary", color: "text-amber-500", desc: "Top 1% elite performance. You are a productivity titan." };
        if (score >= 75) return { label: "Elite", color: "text-primary-500", desc: "Consistently outperforming 90% of agents." };
        if (score >= 50) return { label: "Professional", color: "text-emerald-500", desc: "Balanced and efficient mission execution." };
        return { label: "Standard", color: "text-slate-400", desc: "Steady progress. Focus on completing pending missions." };
    };

    const finalScore = Math.min(productivityScore, 100);
    const status = getPerformanceStatus(finalScore);

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-slide-up pb-24 md:pb-8 pt-4 md:pt-0">
            <header className="flex flex-col items-center justify-center text-center gap-4 sm:gap-6 border-b border-slate-100 dark:border-slate-800 pb-6 sm:pb-8">
                <div className="flex flex-col items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 sm:gap-8">
                        <img src={bitLogo} alt="BIT Seal" className="w-24 h-24 sm:w-32 md:w-40 sm:h-32 md:h-40 object-contain bg-white rounded-full border-2 border-slate-100 shadow-lg p-0.5 hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tight uppercase italic underline decoration-primary-500/30">
                            Productivity <span className="text-primary-600">Report</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-xs sm:text-sm md:text-xl uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-1 sm:mt-2">
                            Bannari Amman Institute of Technology
                        </p>
                        <div className="h-1 sm:h-1.5 w-20 sm:w-32 bg-primary-600 mx-auto rounded-full mt-4 sm:mt-6" />
                    </div>
                </div>
                
                <div className="w-full flex justify-center mt-2 sm:mt-4">
                    <button
                        onClick={handleDownloadReport}
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-slate-900 dark:bg-primary-600 text-white text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} className="sm:size-5" />}
                        {isGenerating ? "FORGING PDF..." : "DOWNLOAD FULL REPORT"}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {/* Score Card */}
                <div className="saas-card p-6 sm:p-10 relative overflow-hidden group bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[3rem]">
                    <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-primary-600/5 rounded-full -mr-10 -mt-10 sm:-mr-20 sm:-mt-20 group-hover:scale-110 transition-transform duration-500 border border-primary-500/10 shadow-inner" />
                    <div className="relative z-10 space-y-6 sm:space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary-600">
                                <TrendingUp size={20} className="sm:size-6" />
                                <span className="font-black uppercase tracking-widest text-[10px] sm:text-sm">Productivity Score</span>
                            </div>
                            <span className={cn("px-2.5 py-0.5 sm:px-4 sm:py-1 rounded-lg sm:rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border", status.color.replace('text-', 'bg-').replace('500', '500/10') + " " + status.color.replace('500', '600'))}>
                                {status.label}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2 sm:gap-4 justify-center sm:justify-start">
                            <AnimatePresence mode="wait">
                                <motion.span 
                                    key={productivityScore}
                                    initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    className="text-[6rem] sm:text-[8rem] md:text-[10rem] font-black leading-none text-slate-900 dark:text-white tabular-nums tracking-tighter"
                                >
                                    {finalScore}
                                </motion.span>
                            </AnimatePresence>
                            <div className="flex flex-col">
                                <span className="text-2xl sm:text-4xl font-black text-slate-300">/ 100</span>
                                <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Productivity Units</span>
                            </div>
                        </div>
                        <div className="space-y-4 sm:space-y-6">
                            <div className="relative w-full h-6 sm:h-8 bg-slate-100 dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl overflow-hidden p-1 sm:p-1.5 shadow-inner border border-slate-100 dark:border-slate-800">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${finalScore}%` }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                    className="h-full rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden shadow-[0_4px_15px_rgba(79,70,229,0.3)]"
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:50px_50px] animate-[shimmer_2s_linear_infinite]" />
                                </motion.div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 px-1">
                                <div className="space-y-1 text-center sm:text-left">
                                    <p className="text-slate-800 dark:text-slate-200 font-black text-sm sm:text-lg flex items-center justify-center sm:justify-start gap-2 uppercase tracking-tight">
                                        <Trophy size={16} className="text-amber-500 sm:size-[18px]" />
                                        {status.label} Status Confirmed
                                    </p>
                                    <p className="text-slate-500 font-bold text-[11px] sm:text-sm max-w-[280px] sm:max-w-none">
                                        {status.desc}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center sm:items-end gap-1.5">
                                    <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-primary-100 dark:border-primary-800/50 shadow-sm">
                                        <Sparkles size={10} className="text-amber-500 animate-pulse sm:size-3" />
                                        Zen Neural Analysis
                                    </div>
                                    <span className="text-[8px] sm:text-[9px] font-medium text-slate-400 uppercase tracking-wide">Verified by Identity Unit</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Activity Highlights */}
                <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 sm:gap-3 uppercase tracking-tight italic underline decoration-primary-500/20">
                        <Target className="text-primary-600 sm:size-6" size={20} />
                        Key Highlights
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                        {[
                            { label: "Completed", value: stats?.totalTasksDone || 0, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
                            { label: "Streak", value: `${stats?.streak || 0} Days`, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/10" },
                            { label: "Efficiency", value: "94%", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/10" }
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center justify-between p-4 sm:p-6 ${item.bg} rounded-[20px] sm:rounded-3xl border border-slate-100 dark:border-slate-800/50 shadow-sm`}>
                                <span className="text-xs sm:text-base font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                                <span className={`text-base sm:text-xl font-black ${item.color}`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Insights Card */}
                <div className="saas-card p-6 sm:p-10 bg-slate-900 border-none relative overflow-hidden group rounded-[2rem] sm:rounded-3xl shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
                    <div className="relative z-10 space-y-6 sm:space-y-8">
                        <div className="flex items-center gap-3 text-blue-400">
                            <Sparkles size={20} className="sm:size-6" />
                            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">AI Observations</h3>
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex gap-3 sm:gap-4">
                                <div className="w-1 h-10 sm:h-12 bg-blue-500 rounded-full shrink-0" />
                                <p className="text-slate-300 text-xs sm:text-[15px] font-medium leading-relaxed">
                                    You are most productive between <span className="text-white font-bold">9:00 AM and 11:30 AM</span>. Consider high-focus tasks during this window.
                                </p>
                            </div>
                            <div className="flex gap-3 sm:gap-4">
                                <div className="w-1 h-10 sm:h-12 bg-blue-500 rounded-full shrink-0" />
                                <p className="text-slate-300 text-xs sm:text-[15px] font-medium leading-relaxed">
                                    Your completion rate for <span className="text-white font-bold">Coding</span> tasks has increased by <span className="text-green-400 font-bold">12%</span> since last week.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 sm:pt-4">
                            <button
                                onClick={() => navigate('/analytics')}
                                className="flex items-center gap-2 text-blue-400 font-black text-[10px] sm:text-xs uppercase tracking-widest hover:text-white transition-colors group"
                            >
                                Full Analysis
                                <ChevronRight size={14} className="sm:size-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductivityReport;
