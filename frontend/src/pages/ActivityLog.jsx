import React, { useState, useEffect } from 'react';
import { getActivities, clearActivities } from '../services/activityService';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, Loader2, History, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const ActivityLog = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await getActivities();
            setActivities(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load activity log.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        if (!window.confirm("Are you sure you want to clear your entire activity history? This cannot be undone.")) return;
        try {
            await clearActivities();
            setActivities([]);
        } catch (err) {
            alert("Failed to clear history.");
        }
    };

    const getActionColor = (action) => {
        if (action.includes('created')) return 'text-green-600 bg-green-50';
        if (action.includes('deleted')) return 'text-red-600 bg-red-50';
        if (action.includes('completed')) return 'text-blue-600 bg-blue-50';
        return 'text-slate-600 bg-slate-50';
    };

    const formatAction = (action) => {
        return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
                    <p className="text-slate-500">Track your productivity journey.</p>
                </div>
                {activities.length > 0 && (
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <Trash2 size={18} /> Clear History
                    </button>
                )}
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Loading history...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-center">
                    <p>{error}</p>
                </div>
            ) : activities.length > 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-50">
                        {activities.map((activity, index) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={activity.id}
                                className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors"
                            >
                                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${getActionColor(activity.action)}`}>
                                    <History size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                                        <p className="text-sm font-semibold text-slate-800">
                                            {formatAction(activity.action)}: <span className="text-slate-600">{activity.metadata?.title || "Unknown Task"}</span>
                                        </p>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            <Clock size={12} />
                                            {format(new Date(activity.createdAt), 'MMM dd, yyyy • hh:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Log ID: {activity.id.slice(-8)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                        <History size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">History is empty</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">
                        Your actions will appear here as you interact with tasks.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ActivityLog;
