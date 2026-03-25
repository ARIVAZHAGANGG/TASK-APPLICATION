import React from 'react';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const SupportTasks = ({ tasks = [] }) => {
    const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    My Pending Tasks
                </h3>
                <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full font-medium">
                    {pendingTasks.length} total
                </span>
            </div>

            {pendingTasks.length > 0 ? (
                <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 rounded-xl mb-4">
                        <div className="flex gap-2">
                            <AlertCircle className="text-blue-500 flex-shrink-0" size={16} />
                            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                                AI Suggestion: Focus on <strong>{pendingTasks[0].title}</strong> first to maintain momentum.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {pendingTasks.map((task) => (
                            <div
                                key={task._id}
                                className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-3 shadow-sm"
                            >
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                        {task.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Calendar size={12} className="text-slate-400" />
                                        <span className="text-[10px] text-slate-400">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-3">
                        <CheckCircle size={32} />
                    </div>
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">All caught up!</h4>
                    <p className="text-xs text-slate-500 mt-1">You have no pending tasks to complete.</p>
                </div>
            )}
        </div>
    );
};

export default SupportTasks;
