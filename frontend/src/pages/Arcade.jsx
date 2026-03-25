import React, { useState } from 'react';
import { Gamepad2, Sparkles, Trophy, Info, Swords, MousePointer2 } from 'lucide-react';
import ZenSnake from '../components/arcade/ZenSnake';
import TaskInvaders from '../components/arcade/TaskInvaders';
import WhackADistraction from '../components/arcade/WhackADistraction';

const Arcade = () => {
    const [activeGame, setActiveGame] = useState('snake');

    const games = [
        { id: 'snake', name: 'Zen Snake', icon: Gamepad2, component: ZenSnake, description: "Collect focus orbs to grow." },
        { id: 'invaders', name: 'Task Invaders', icon: Swords, component: TaskInvaders, description: "Defend against distraction bugs." },
        { id: 'whack', name: 'Focus Trainer', icon: MousePointer2, component: WhackADistraction, description: "Smash distractions fast." }
    ];

    const ActiveGameComponent = games.find(g => g.id === activeGame).component;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-slide-up">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Zen <span className="text-primary-600">Arcade</span></h1>
                    <p className="text-slate-500 font-bold mt-1 text-lg italic">"Short breaks keep the focus sharp."</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-2xl font-black text-sm">
                    <Trophy size={18} />
                    GAMIFIED BREAKS ACTIVE
                </div>
            </header>

            {/* Game Selector Tabs */}
            <div className="flex flex-wrap gap-4">
                {games.map(game => (
                    <button
                        key={game.id}
                        onClick={() => setActiveGame(game.id)}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all duration-300 ${activeGame === game.id
                                ? 'bg-slate-900 dark:bg-primary-600 text-white shadow-xl scale-105 border-primary-500 border-2'
                                : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        <game.icon size={20} />
                        {game.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Game Area */}
                <div className="lg:col-span-2 saas-card p-12 bg-slate-900 border-none relative overflow-hidden group min-h-[600px] flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-sky-500 to-blue-500 animate-shimmer" />

                    <div className="relative z-10 w-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3 text-blue-400">
                                <h3 className="text-2xl font-black text-white">{games.find(g => g.id === activeGame).name}</h3>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-blue-300 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                LIVE XP
                            </div>
                        </div>

                        <ActiveGameComponent />
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="saas-card p-8 space-y-6 border-blue-500/10 bg-blue-500/5">
                        <div className="flex items-center gap-3 text-blue-600">
                            <Sparkles size={20} />
                            <h4 className="font-black uppercase tracking-widest text-sm">Game Insights</h4>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
                            {games.find(g => g.id === activeGame).description} These games are designed to train your <span className="text-blue-600 font-bold">visual reflexes</span> and <span className="text-blue-600 font-bold">pattern recognition</span>.
                        </p>

                        <div className="pt-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <h5 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Global Payout</h5>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">Reward Rate</span>
                                <span className="text-blue-600 font-black">10% Score to XP</span>
                            </div>
                        </div>
                    </div>

                    <div className="saas-card p-8 space-y-4">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Info size={18} />
                            <h4 className="font-black uppercase tracking-widest text-xs">Arcade Rules</h4>
                        </div>
                        <ul className="space-y-3 text-xs font-bold text-slate-500 list-disc pl-4">
                            <li>XP rewarded on Mission Failure or Time Expired.</li>
                            <li>Weekly leaderboards coming soon.</li>
                            <li>Daily best is saved locally.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Arcade;
