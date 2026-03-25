import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, Coffee, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { toast } from 'sonner';

const FocusPanel = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // focus, break
    const [sessionId, setSessionId] = useState(null);
    const [pointsEarned, setPointsEarned] = useState(0);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleSessionComplete();
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleSessionComplete = async () => {
        setIsActive(false);
        const reward = mode === 'focus' ? 50 : 0;

        try {
            if (mode === 'focus' && sessionId) {
                await api.post(`/tasks/pomodoro/${sessionId}/complete`, { duration: 25 * 60 });
                toast.success("Focus session completed! +50 XP", {
                    icon: <Zap className="text-amber-500" />
                });
            }

            // Switch mode
            if (mode === 'focus') {
                setMode('break');
                setTimeLeft(5 * 60);
                setSessionId(null);
            } else {
                setMode('focus');
                setTimeLeft(25 * 60);
            }
        } catch (err) {
            console.error("Failed to record focus session");
            toast.error("Session sync failed");
        }
    };

    const toggleTimer = async () => {
        if (!isActive) {
            // Starting
            if (mode === 'focus') {
                try {
                    const res = await api.post('/tasks/pomodoro/start');
                    setSessionId(res.data._id);
                } catch (err) {
                    console.error("Failed to start session");
                }
            }
            setIsActive(true);
        } else {
            // Pausing
            setIsActive(false);
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="saas-card p-8 text-center relative overflow-hidden">
            {/* Background Animation */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.05 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 saas-gradient"
                    />
                )}
            </AnimatePresence>

            <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${mode === 'focus'
                        ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                        : 'bg-green-500/10 text-green-600 border border-green-500/20'
                        }`}>
                        {mode === 'focus' ? <Target size={12} /> : <Coffee size={12} />}
                        {mode} mode
                    </div>
                </div>

                <h2 className="text-7xl font-black text-slate-800 dark:text-white mb-8 font-mono tracking-tighter">
                    {formatTime(timeLeft)}
                </h2>

                <div className="flex items-center justify-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetTimer}
                        className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <RotateCcw size={20} strokeWidth={2.5} />
                    </motion.button>

                    <button
                        onClick={toggleTimer}
                        className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${isActive
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 overflow-hidden'
                            : 'saas-gradient text-white shadow-blue-500/20'
                            }`}
                    >
                        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>

                    <div className="w-12 h-12" /> {/* Spacer */}
                </div>

                <div className="mt-10 flex items-center justify-center gap-8 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black tracking-widest">
                    <div className="flex flex-col items-center">
                        <span className="text-slate-800 dark:text-slate-200 text-base">25m</span>
                        <span>Focus</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:border-slate-800" />
                    <div className="flex flex-col items-center">
                        <span className="text-slate-800 dark:text-slate-200 text-base">5m</span>
                        <span>Break</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusPanel;
