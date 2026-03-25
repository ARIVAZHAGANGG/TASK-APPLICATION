import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const StatsCard = ({ title, value, icon: Icon, trend, color, index = 0, onClick, className }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onClick}
            className={cn(
                "bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-6 group hover:shadow-xl transition-all duration-500 relative overflow-hidden",
                onClick && "cursor-pointer",
                className
            )}
        >
            {/* Ambient Background Glow */}
            <div className={cn(
                "absolute -right-4 -top-4 w-24 h-24 blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none",
                color === 'primary' ? "bg-blue-500" :
                color === 'success' ? "bg-emerald-500" :
                color === 'warning' ? "bg-amber-500" :
                color === 'indigo' ? "bg-indigo-500" :
                "bg-rose-500"
            )} />
            <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg",
                color === 'primary' ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20" :
                    color === 'success' ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20" :
                        color === 'warning' ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/20" :
                        color === 'indigo' ? "bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-indigo-600/20" :
                            "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20"
            )}>
                <Icon size={24} strokeWidth={2.5} />
            </div>

            <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
                <div className="flex items-center gap-3">
                    <h3 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
                    {trend && (
                        <span className={cn(
                            "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider",
                            trend.startsWith("+") ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                        )}>
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default StatsCard;
