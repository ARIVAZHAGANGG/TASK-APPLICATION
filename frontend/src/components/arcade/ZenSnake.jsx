import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Play, RotateCcw, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { toast } from 'sonner';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

const ZenSnake = () => {
    const canvasRef = useRef(null);
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(true);
    const [highScore, setHighScore] = useState(localStorage.getItem('snakeHighScore') || 0);

    // Game loop
    useEffect(() => {
        if (gameOver || isPaused) return;

        const moveSnake = () => {
            const newHead = {
                x: snake[0].x + direction.x,
                y: snake[0].y + direction.y,
            };

            // Wall collision
            if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
                handleGameOver();
                return;
            }

            // Self collision
            if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                handleGameOver();
                return;
            }

            const newSnake = [newHead, ...snake];

            // Food collision
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(s => s + 10);
                generateFood();
            } else {
                newSnake.pop();
            }

            setSnake(newSnake);
        };

        const intervalId = setInterval(moveSnake, 150);
        return () => clearInterval(intervalId);
    }, [snake, direction, food, gameOver, isPaused]);

    // Controls
    useEffect(() => {
        const handleKeyPress = (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                    if (direction.y === 0) setDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                case 's':
                    if (direction.y === 0) setDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                case 'a':
                    if (direction.x === 0) setDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                case 'd':
                    if (direction.x === 0) setDirection({ x: 1, y: 0 });
                    break;
                case ' ':
                    setIsPaused(prev => !prev);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [direction]);

    // Canvas rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const cellSize = canvas.width / GRID_SIZE;

        // Clear canvas
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines (subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
        }

        // Draw Snake
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? '#6366F1' : '#818CF8';
            ctx.shadowBlur = index === 0 ? 15 : 0;
            ctx.shadowColor = '#6366F1';

            // Rounded rectangle for segments
            const x = segment.x * cellSize + 2;
            const y = segment.y * cellSize + 2;
            const size = cellSize - 4;
            ctx.beginPath();
            ctx.roundRect(x, y, size, size, 4);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Draw Food (Focus Orb)
        ctx.fillStyle = '#10B981';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#10B981';
        ctx.beginPath();
        const foodX = food.x * cellSize + cellSize / 2;
        const foodY = food.y * cellSize + cellSize / 2;
        ctx.arc(foodX, foodY, cellSize / 2 - 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

    }, [snake, food]);

    const generateFood = () => {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
            if (!snake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
        }
        setFood(newFood);
    };

    const handleGameOver = async () => {
        setGameOver(true);
        setIsPaused(true);

        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('snakeHighScore', score);
        }

        if (score > 0) {
            try {
                const res = await api.post('/gamification/arcade/reward', { score });
                if (res.data.pointsAdded > 0) {
                    toast.success(`Game Over! Earned ${res.data.pointsAdded} XP`, {
                        icon: <Zap className="text-amber-500" />
                    });
                }
            } catch (err) {
                console.error("Failed to sync game score");
            }
        }
    };

    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setScore(0);
        setGameOver(false);
        setIsPaused(false);
        generateFood();
    };

    return (
        <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-12 text-white">
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Current Score</p>
                    <p className="text-4xl font-black tabular-nums">{score}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Daily Best</p>
                    <p className="text-4xl font-black text-blue-400 tabular-nums">{highScore}</p>
                </div>
            </div>

            <div className="relative group">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    className="rounded-3xl shadow-2xl shadow-blue-500/10 border border-slate-800"
                />

                <AnimatePresence>
                    {(isPaused || gameOver) && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            className="absolute inset-0 flex flex-center items-center justify-center bg-slate-950/60 rounded-3xl"
                        >
                            <div className="text-center space-y-6 p-8">
                                <h3 className="text-4xl font-black text-white italic tracking-tighter">
                                    {gameOver ? 'MISSION FAILED' : 'READY?'}
                                </h3>

                                <div className="space-y-2">
                                    <p className="text-slate-400 font-bold text-sm">
                                        {gameOver ? "Don't let distraction win." : "Arrows or WASD to control."}
                                    </p>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                        Collect Focus Orbs for XP
                                    </p>
                                </div>

                                <button
                                    onClick={gameOver ? resetGame : () => setIsPaused(false)}
                                    className="px-10 py-4 saas-gradient text-white font-black rounded-2xl shadow-xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                                >
                                    {gameOver ? <RotateCcw size={20} /> : <Play size={20} />}
                                    {gameOver ? 'RETRY MISSION' : 'START FOCUS'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-[400px]">
                <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <Zap className="text-amber-500" size={20} />
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">XP Rate</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">10 Score = 1 XP</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <Target className="text-blue-500" size={20} />
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Max XP</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">50 XP / Session</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZenSnake;
