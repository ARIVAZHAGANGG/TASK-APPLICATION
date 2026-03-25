import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ClockCard = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const formatDate = (date) => {
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options).toUpperCase();
    };

    const getDayProgress = (date) => {
        const secondsInDay = 24 * 60 * 60;
        const currentSeconds = (date.getHours() * 3600) + (date.getMinutes() * 60) + date.getSeconds();
        return (currentSeconds / secondsInDay) * 100;
    };

    const progress = getDayProgress(time);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[40px] p-12 border border-white/20 dark:border-slate-800/50 shadow-2xl flex flex-col items-center justify-center gap-8 group"
        >
            <div className="flex flex-col items-center gap-4 w-full">
                <span className="text-7xl md:text-9xl font-black text-slate-900 dark:text-white tracking-widest font-mono drop-shadow-2xl">
                    {formatTime(time)}
                </span>
                
                <div className="w-full max-w-lg h-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden mt-6 backdrop-blur-md border border-white/10">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                    />
                </div>

                <div className="flex flex-col items-center mt-8">
                    <span className="text-xs md:text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] text-center">
                        {formatDate(time)}
                    </span>
                    <div className="h-1 w-12 bg-indigo-500 rounded-full mt-4 opacity-50 group-hover:w-24 transition-all duration-500" />
                </div>
            </div>
        </motion.div>
    );
};


export default ClockCard;
