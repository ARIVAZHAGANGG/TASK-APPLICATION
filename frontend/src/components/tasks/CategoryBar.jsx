import React from 'react';
import { motion } from 'framer-motion';
import {
    Code,
    Briefcase,
    Home,
    Heart,
    GraduationCap,
    User,
    Settings2,
    MoreHorizontal
} from 'lucide-react';
import { cn } from '../../utils/cn';

const categories = [
    { id: 'All', label: 'All Tasks', icon: MoreHorizontal, color: 'slate' },
    { id: 'Coding', label: 'Coding', icon: Code, color: 'blue' },
    { id: 'Work', label: 'Work', icon: Briefcase, color: 'indigo' },
    { id: 'Home', label: 'Home', icon: Home, color: 'emerald' },
    { id: 'Health', label: 'Health', icon: Heart, color: 'rose' },
    { id: 'Study', label: 'Study', icon: GraduationCap, color: 'amber' },
    { id: 'Personal', label: 'Personal', icon: User, color: 'violet' },
    { id: 'Other', label: 'Other', icon: Settings2, color: 'slate' },
];

const categoryThemes = {
    All: {
        active: "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900",
        inactive: "bg-white border-slate-100 text-slate-500 hover:border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-slate-400",
        icon: "text-slate-500"
    },
    Coding: {
        active: "bg-blue-600 border-blue-600 text-white shadow-blue-200",
        inactive: "bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-400",
        icon: "text-blue-500"
    },
    Work: {
        active: "bg-blue-600 border-blue-600 text-white shadow-blue-200",
        inactive: "bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-400",
        icon: "text-blue-500"
    },
    Home: {
        active: "bg-emerald-600 border-emerald-600 text-white shadow-emerald-200",
        inactive: "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400",
        icon: "text-emerald-500"
    },
    Health: {
        active: "bg-rose-600 border-rose-600 text-white shadow-rose-200",
        inactive: "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:border-rose-800/30 dark:text-rose-400",
        icon: "text-rose-500"
    },
    Study: {
        active: "bg-amber-600 border-amber-600 text-white shadow-amber-200",
        inactive: "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-400",
        icon: "text-amber-500"
    },
    Personal: {
        active: "bg-violet-600 border-violet-600 text-white shadow-violet-200",
        inactive: "bg-violet-50 border-violet-100 text-violet-600 hover:bg-violet-100 dark:bg-violet-900/20 dark:border-violet-800/30 dark:text-violet-400",
        icon: "text-violet-500"
    },
    Other: {
        active: "bg-slate-700 border-slate-700 text-white",
        inactive: "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400",
        icon: "text-slate-500"
    }
};

const CategoryBar = ({ activeCategory, onCategoryChange, counts = {} }) => {
    return (
        <div className="w-full relative px-1 mb-8 overflow-hidden">
            <div className="flex overflow-x-auto no-scrollbar gap-3 pb-4 pt-2 -mx-1 px-1 mask-linear-fade">
                {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const Icon = cat.icon;
                    const theme = categoryThemes[cat.id] || categoryThemes.Other;

                    return (
                        <motion.button
                            key={cat.id}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onCategoryChange(cat.id)}
                            className={cn(
                                "flex items-center gap-2.5 px-6 py-3.5 rounded-2xl whitespace-nowrap transition-all duration-300 border-2 shrink-0 relative overflow-hidden group",
                                isActive ? theme.active : theme.inactive,
                                isActive && "shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)]"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-colors",
                                isActive ? "bg-white/20" : "bg-white/50 dark:bg-white/5"
                            )}>
                                <Icon size={18} className={isActive ? "text-white dark:text-inherit" : theme.icon} />
                            </div>

                            <span className="text-sm font-extrabold tracking-tight">{cat.label}</span>

                            {counts[cat.id] !== undefined && (
                                <span className={cn(
                                    "text-[10px] font-black px-2.5 py-0.5 rounded-full min-w-[20px] text-center",
                                    isActive
                                        ? "bg-white/20 text-white dark:bg-black/20"
                                        : "bg-black/5 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                                )}>
                                    {counts[cat.id]}
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryBar;
