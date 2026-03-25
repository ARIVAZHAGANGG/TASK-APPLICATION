import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play, Zap, Bug, Rocket } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 450;
const PLAYER_SIZE = 40;
const INVADER_ROWS = 3;
const INVADER_COLS = 6;
const INVADER_SIZE = 30;

const TaskInvaders = () => {
    const canvasRef = useRef(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(true);
    const [highScore, setHighScore] = useState(localStorage.getItem('invadersHighScore') || 0);

    const gameState = useRef({
        player: { x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2, y: CANVAS_HEIGHT - 60 },
        bullets: [],
        invaders: [],
        invaderDirection: 1,
        invaderStep: 0,
        lastShot: 0,
        keys: {}
    });

    const initInvaders = () => {
        const invaders = [];
        for (let row = 0; row < INVADER_ROWS; row++) {
            for (let col = 0; col < INVADER_COLS; col++) {
                invaders.push({
                    x: col * (INVADER_SIZE + 20) + 50,
                    y: row * (INVADER_SIZE + 20) + 40,
                    id: row * INVADER_COLS + col,
                    type: row === 0 ? 'Bug' : 'Distraction'
                });
            }
        }
        gameState.current.invaders = invaders;
    };

    useEffect(() => {
        initInvaders();
    }, []);

    const handleGameOver = async (finalScore) => {
        setGameOver(true);
        setIsPaused(true);
        if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('invadersHighScore', finalScore);
        }

        if (finalScore > 0) {
            try {
                const res = await api.post('/gamification/arcade/reward', { score: finalScore });
                if (res.data.pointsAdded > 0) {
                    toast.success(`Mission Success! Earned ${res.data.pointsAdded} XP`, {
                        icon: <Zap className="text-amber-500" />
                    });
                }
            } catch (err) {
                console.error("Failed to sync score");
            }
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let animationFrameId;

        const update = () => {
            if (isPaused || gameOver) return;

            const state = gameState.current;

            // Player movement
            if (state.keys['ArrowLeft'] || state.keys['a']) {
                state.player.x = Math.max(0, state.player.x - 5);
            }
            if (state.keys['ArrowRight'] || state.keys['d']) {
                state.player.x = Math.min(CANVAS_WIDTH - PLAYER_SIZE, state.player.x + 5);
            }

            // Shooting
            const now = Date.now();
            if ((state.keys[' '] || state.keys['ArrowUp']) && now - state.lastShot > 400) {
                state.bullets.push({ x: state.player.x + PLAYER_SIZE / 2, y: state.player.y });
                state.lastShot = now;
            }

            // Update bullets
            state.bullets = state.bullets.filter(b => b.y > 0);
            state.bullets.forEach(b => b.y -= 7);

            // Update invaders
            state.invaderStep++;
            if (state.invaderStep > 60) {
                state.invaderStep = 0;
                let hitWall = false;
                state.invaders.forEach(inv => {
                    inv.x += state.invaderDirection * 10;
                    if (inv.x > CANVAS_WIDTH - INVADER_SIZE - 20 || inv.x < 20) hitWall = true;
                });

                if (hitWall) {
                    state.invaderDirection *= -1;
                    state.invaders.forEach(inv => inv.y += 15);
                }
            }

            // Collision detection
            state.bullets.forEach((bullet, bIndex) => {
                state.invaders.forEach((invader, iIndex) => {
                    if (bullet.x > invader.x && bullet.x < invader.x + INVADER_SIZE &&
                        bullet.y > invader.y && bullet.y < invader.y + INVADER_SIZE) {
                        state.invaders.splice(iIndex, 1);
                        state.bullets.splice(bIndex, 1);
                        setScore(s => s + 20);
                    }
                });
            });

            // Check Game Over
            if (state.invaders.some(inv => inv.y + INVADER_SIZE > state.player.y)) {
                handleGameOver(score);
            }

            // Check Win (New Wave)
            if (state.invaders.length === 0) {
                initInvaders();
                setScore(s => s + 100);
            }

            draw();
            animationFrameId = requestAnimationFrame(update);
        };

        const draw = () => {
            ctx.fillStyle = '#0F172A';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            const state = gameState.current;

            // Draw Player (Rocket)
            ctx.fillStyle = '#6366F1';
            ctx.beginPath();
            ctx.moveTo(state.player.x + PLAYER_SIZE / 2, state.player.y);
            ctx.lineTo(state.player.x + PLAYER_SIZE, state.player.y + PLAYER_SIZE);
            ctx.lineTo(state.player.x, state.player.y + PLAYER_SIZE);
            ctx.closePath();
            ctx.fill();

            // Draw Bullets
            ctx.fillStyle = '#F43F5E';
            state.bullets.forEach(b => {
                ctx.fillRect(b.x - 2, b.y - 10, 4, 10);
            });

            // Draw Invaders
            state.invaders.forEach(inv => {
                ctx.fillStyle = inv.type === 'Bug' ? '#F59E0B' : '#8B5CF6';
                ctx.fillRect(inv.x, inv.y, INVADER_SIZE, INVADER_SIZE);
                // Simple "bug" eyes
                ctx.fillStyle = 'white';
                ctx.fillRect(inv.x + 5, inv.y + 5, 5, 5);
                ctx.fillRect(inv.x + INVADER_SIZE - 10, inv.y + 5, 5, 5);
            });
        };

        const handleKeys = (e) => {
            if (e.type === 'keydown') gameState.current.keys[e.key] = true;
            else delete gameState.current.keys[e.key];
        };

        window.addEventListener('keydown', handleKeys);
        window.addEventListener('keyup', handleKeys);
        update();

        return () => {
            window.removeEventListener('keydown', handleKeys);
            window.removeEventListener('keyup', handleKeys);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPaused, gameOver, score]);

    const resetGame = () => {
        gameState.current.player = { x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2, y: CANVAS_HEIGHT - 60 };
        gameState.current.bullets = [];
        gameState.current.keys = {};
        initInvaders();
        setScore(0);
        setGameOver(false);
        setIsPaused(false);
    };

    return (
        <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-12 text-white">
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Combat Score</p>
                    <p className="text-4xl font-black tabular-nums">{score}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Defense Best</p>
                    <p className="text-4xl font-black text-rose-400 tabular-nums">{highScore}</p>
                </div>
            </div>

            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="rounded-3xl shadow-2xl border border-slate-800"
                />

                <AnimatePresence>
                    {(isPaused || gameOver) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-3xl backdrop-blur-md"
                        >
                            <div className="text-center space-y-6">
                                <h3 className="text-3xl font-black text-white italic tracking-tighter">
                                    {gameOver ? 'PLANET OVERRUN' : 'TASK INVADERS'}
                                </h3>
                                <div className="text-slate-400 text-sm font-bold">
                                    {gameOver ? "The distractions have won." : "Arrows/AD to move, Space to shoot."}
                                </div>
                                <button
                                    onClick={gameOver ? resetGame : () => setIsPaused(false)}
                                    className="px-10 py-4 bg-rose-600 text-white font-black rounded-2xl shadow-xl shadow-rose-500/40"
                                >
                                    {gameOver ? <RotateCcw size={20} className="inline mr-2" /> : <Play size={20} className="inline mr-2" />}
                                    {gameOver ? 'RE-DEPLOY' : 'START DEFENSE'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TaskInvaders;
