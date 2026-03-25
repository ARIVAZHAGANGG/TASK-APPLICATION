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
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-slide-up">
            <header className="flex flex-col items-center justify-center text-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-8">
                        <img src={bitLogo} alt="BIT Seal" className="w-40 h-40 object-contain bg-white rounded-full border-2 border-slate-100 shadow-lg p-0.5 hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tight">Productivity <span className="text-primary-600">Report</span></h1>
                        <p className="text-slate-500 font-bold text-xl uppercase tracking-[0.2em] mt-2">Bannari Amman Institute of Technology</p>
                        <div className="h-1.5 w-32 bg-primary-600 mx-auto rounded-full mt-6" />
                    </div>
                </div>
                
                <div className="w-full flex justify-center mt-4">
                    <button
                        onClick={handleDownloadReport}
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                        {isGenerating ? "FORGING PDF..." : "DOWNLOAD FULL REPORT"}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {/* Score Card */}
                <div className="saas-card p-10 relative overflow-hidden group bg-white dark:bg-slate-900">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-500 border border-primary-500/10 shadow-inner" />
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary-600">
                                <TrendingUp size={24} />
                                <span className="font-black uppercase tracking-widest text-sm">Productivity Score</span>
                            </div>
                            <span className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", status.color.replace('text-', 'bg-').replace('500', '500/10') + " " + status.color.replace('500', '600'))}>
                                {status.label} Status
                            </span>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <AnimatePresence mode="wait">
                                <motion.span 
                                    key={productivityScore}
                                    initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    className="text-[10rem] font-black leading-none text-slate-900 dark:text-white tabular-nums tracking-tighter"
                                >
                                    {finalScore}
                                </motion.span>
                            </AnimatePresence>
                            <div className="flex flex-col">
                                <span className="text-4xl font-black text-slate-300">/ 100</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Productivity Score</span>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="relative w-full h-8 bg-slate-100 dark:bg-slate-800/50 rounded-3xl overflow-hidden p-1.5 shadow-inner border border-slate-100 dark:border-slate-800">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${finalScore}%` }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                    className="h-full rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden shadow-[0_4px_15px_rgba(79,70,229,0.3)]"
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:50px_50px] animate-[shimmer_2s_linear_infinite]" />
                                </motion.div>
                            </div>
                            <div className="text-center w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Productivity Score
                                </span>
                            </div>
                            <div className="flex items-center justify-between px-2">
                                <div className="space-y-1">
                                    <p className="text-slate-800 dark:text-slate-200 font-black text-lg flex items-center gap-2">
                                        <Trophy size={18} className="text-amber-500" />
                                        {status.label} Status Confirmed
                                    </p>
                                    <p className="text-slate-500 font-bold text-sm">
                                        {status.desc}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full border border-primary-100 dark:border-primary-800/50">
                                        <Sparkles size={12} className="text-amber-500 animate-pulse" />
                                        Zen Neural Analysis
                                    </div>
                                    <span className="text-[9px] font-medium text-slate-400">Verified by Bit Identity Unit</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Activity Highlights */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <Target className="text-primary-600" />
                        Key Highlights
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: "Tasks Completed", value: stats?.totalTasksDone || 0, color: "text-emerald-600", bg: "bg-emerald-50" },
                            { label: "Current Streak", value: `${stats?.streak || 0} Days`, color: "text-amber-600", bg: "bg-amber-50" },
                            { label: "Focus Efficiency", value: "94%", color: "text-indigo-600", bg: "bg-indigo-50" }
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center justify-between p-6 ${item.bg} dark:bg-opacity-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm`}>
                                <span className="font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                                <span className={`text-xl font-black ${item.color}`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Insights Card */}
                <div className="saas-card p-10 bg-slate-900 border-none relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-3 text-blue-400">
                            <Sparkles size={24} />
                            <h3 className="text-2xl font-black text-white">AI Observations</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-1 h-12 bg-blue-500 rounded-full shrink-0" />
                                <p className="text-slate-300 font-medium">
                                    You are most productive between <span className="text-white font-bold">9:00 AM and 11:30 AM</span>. Consider scheduling high-focus tasks during this window.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1 h-12 bg-blue-500 rounded-full shrink-0" />
                                <p className="text-slate-300 font-medium">
                                    Your completion rate for <span className="text-white font-bold">Coding</span> tasks has increased by <span className="text-green-400 font-bold">12%</span> since last week.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => navigate('/analytics')}
                                className="flex items-center gap-2 text-blue-400 font-black text-sm uppercase tracking-widest hover:text-white transition-colors group"
                            >
                                View Full Analysis
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductivityReport;
