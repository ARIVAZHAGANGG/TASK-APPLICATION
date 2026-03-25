import React from 'react';
import FocusPanel from '../components/focus/FocusPanel';
import { Target, Info } from 'lucide-react';

const FocusMode = () => {
    return (
        <div className="max-w-4xl mx-auto py-10">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Deep Work Session</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Unlock peak productivity with science-backed focus intervals.</p>
                </div>
                <div className="w-16 h-16 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center">
                    <Target size={32} strokeWidth={2.5} />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">
                    <FocusPanel />
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20">
                        <div className="flex items-center gap-2 mb-4">
                            <Info size={20} strokeWidth={2.5} />
                            <h3 className="font-black uppercase tracking-widest text-xs">AI Protocol</h3>
                        </div>
                        <p className="text-blue-100 font-bold text-sm leading-relaxed">
                            Focus for 25 minutes, then rest for 5. Complete 4 sessions for a major XP bonus!
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Benefits</h3>
                        <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-bold">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Eliminates distractions
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Boosts mental clarity
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Prevents burnout
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusMode;
