import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Trash2, X, Layers } from 'lucide-react';
import { cn } from '../../utils/cn';

const SelectionToolbar = ({
    selectedCount,
    onComplete,
    onDelete,
    onCancel
}) => {
    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-[80] w-[95%] max-w-2xl"
                >
                    <div className="bg-slate-900 dark:bg-white rounded-[2rem] p-3 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_24px_48px_-12px_rgba(255,255,255,0.1)] flex items-center justify-between border border-white/10 dark:border-slate-200">
                        <div className="flex items-center gap-4 px-4">
                            <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                <Layers size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white dark:text-slate-900 font-black text-sm tracking-tight">
                                    {selectedCount} {selectedCount === 1 ? 'Task' : 'Tasks'} Selected
                                </span>
                                <span className="text-white/50 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                    Bulk Actions Active
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={onComplete}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle2 size={16} strokeWidth={3} />
                                <span className="hidden sm:inline">Complete All</span>
                            </button>

                            <button
                                onClick={onDelete}
                                className="flex items-center justify-center w-12 h-12 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all active:scale-95"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="w-px h-8 bg-white/10 dark:bg-slate-200 mx-1" />

                            <button
                                onClick={onCancel}
                                className="flex items-center justify-center w-12 h-12 text-white/50 dark:text-slate-400 hover:text-white dark:hover:text-slate-900 hover:bg-white/10 dark:hover:bg-slate-100 rounded-2xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SelectionToolbar;
