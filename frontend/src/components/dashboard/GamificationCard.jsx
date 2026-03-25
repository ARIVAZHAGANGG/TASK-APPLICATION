import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, ChevronRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const GamificationCard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/gamification/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch gamification stats");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />;
    }

    if (!stats) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="saas-card p-6 relative overflow-hidden group"
        >
            {/* Background Decoration */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                            <Trophy size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Level {stats.level}</h3>
                            <p className="text-xl font-black text-slate-800 dark:text-white">Elite Performer</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.points}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total XP</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>XP Progress</span>
                        <span>{stats.progress.percentage}% to Level {stats.progress.nextLevel}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.progress.percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-sm"
                        />
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 text-orange-500 mb-1">
                            <Zap size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Streak</span>
                        </div>
                        <p className="text-lg font-black text-slate-800 dark:text-white">{stats.streak} Days</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 text-blue-500 mb-1">
                            <Award size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Badges</span>
                        </div>
                        <p className="text-lg font-black text-slate-800 dark:text-white">{stats.achievements?.length || 0}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default GamificationCard;
