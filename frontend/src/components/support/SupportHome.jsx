import React from 'react';
import { Search, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SupportHome = ({ userName, onSearch }) => {
    return (
        <div className="p-4 space-y-6">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    Hello {userName}!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    How can I help you today?
                </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500" size={18} />
                <span className="text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                    All Systems Operational
                </span>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search for help..."
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all dark:text-slate-200"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Links
                </h3>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        "How to create a task?",
                        "Resetting my password",
                        "Understanding my score",
                        "Enabling notifications"
                    ].map((item, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ x: 4 }}
                            onClick={() => onSearch(item)}
                            className="text-left p-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors"
                        >
                            {item}
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SupportHome;
