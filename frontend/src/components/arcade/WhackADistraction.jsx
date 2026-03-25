import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play, Zap, MousePointer2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

const GRID_SIZE = 3;
const ROUND_TIME = 30000; // 30 seconds

const WhackADistraction = () => {
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
    const [activeMole, setActiveMole] = useState(null);
    const [isPaused, setIsPaused] = useState(true);
    const [highScore, setHighScore] = useState(localStorage.getItem('whackHighScore') || 0);

    const spawnMole = useCallback(() => {
        if (gameOver || isPaused) return;
        const newMole = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
        setActiveMole(newMole);

        // Speed up as time goes by
        const timeout = Math.max(400, 1000 - (score * 5));
        setTimeout(() => {
            setActiveMole(null);
            if (!gameOver) setTimeout(spawnMole, Math.random() * 500 + 200);
        }, timeout);
    }, [gameOver, isPaused, score]);

    useEffect(() => {
        if (!isPaused && !gameOver) {
            spawnMole();
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        handleGameOver();
                        return 0;
                    }
                    return prev - 100;
                });
            }, 100);
            return () => clearInterval(timer);
        }
    }, [isPaused, gameOver]);

    const handleGameOver = async () => {
        setGameOver(true);
        setIsPaused(true);
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('whackHighScore', score);
        }

        if (score > 0) {
            try {
                const res = await api.post('/gamification/arcade/reward', { score });
                if (res.data.pointsAdded > 0) {
                    toast.success(`Distractions Cleared! Earned ${res.data.pointsAdded} XP`, {
                        icon: <Zap className="text-amber-500" />
                    });
                }
            } catch (err) {
                console.error("Score sync failed");
            }
        }
    };

    const whack = (index) => {
        if (index === activeMole) {
            setScore(s => s + 10);
            setActiveMole(null);
        }
    };

    const reset = () => {
        setScore(0);
        setTimeLeft(ROUND_TIME);
        setGameOver(false);
        setIsPaused(false);
        setActiveMole(null);
    };

    return (
        <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-12 text-white">
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Reflex Score</p>
                    <p className="text-4xl font-black tabular-nums">{score}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Time Left</p>
                    <p className="text-4xl font-black text-amber-400 tabular-nums">{(timeLeft / 1000).toFixed(1)}s</p>
                </div>
            </div>

            <div className="relative bg-slate-800 p-8 rounded-[40px] shadow-inner">
                <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div
                            key={i}
                            onClick={() => whack(i)}
                            className="w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-700 relative overflow-hidden cursor-crosshair group shadow-xl"
                        >
                            <AnimatePresence>
                                {activeMole === i && (
                                    <motion.div
                                        initial={{ y: 100 }}
                                        animate={{ y: 0 }}
                                        exit={{ y: 100 }}
                                        className="absolute inset-0 bg-blue-500 flex items-center justify-center text-white"
                                    >
                                        <AlertCircle size={40} className="animate-pulse" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <AnimatePresence>
                    {(isPaused || gameOver) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-[40px] backdrop-blur-sm"
                        >
                            <div className="text-center space-y-6">
                                <h3 className="text-3xl font-black text-white italic tracking-tighter">
                                    {gameOver ? 'TIME EXPIRED' : 'FOCUS TRAINER'}
                                </h3>
                                <p className="text-slate-400 text-sm font-bold">Whack the blue distraction orbs!</p>
                                <button
                                    onClick={gameOver ? reset : () => setIsPaused(false)}
                                    className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl"
                                >
                                    {gameOver ? 'RETRY' : 'BEGIN'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WhackADistraction;
