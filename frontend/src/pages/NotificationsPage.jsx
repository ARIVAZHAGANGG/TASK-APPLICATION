import React, { useState, useEffect } from 'react';
import { getNotifications, markAllAsRead, markAsRead, clearNotifications } from '../services/notificationService';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, Loader2, CheckCircle2, AlertCircle, Clock, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await getNotifications();
            setNotifications(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleClear = async () => {
        if (!window.confirm("Are you sure you want to clear all notification history?")) return;
        try {
            await clearNotifications();
            setNotifications([]);
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'task_completed': return <CheckCircle2 size={18} />;
            case 'task_due_soon': return <AlertCircle size={18} />;
            default: return <Bell size={18} />;
        }
    };

    const getStyles = (type) => {
        switch (type) {
            case 'task_completed': return 'bg-green-100 text-green-600';
            case 'task_due_soon': return 'bg-red-100 text-red-600';
            default: return 'bg-blue-100 text-blue-600';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-slate-500">Stay updated with your latest task activities.</p>
                </div>
                <div className="flex items-center gap-3">
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <Trash2 size={18} /> Clear All
                        </button>
                    )}
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Loading notifications...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-center">
                    <p>{error}</p>
                </div>
            ) : notifications.length > 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden divide-y divide-slate-50">
                    {notifications.map((n, index) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={cn(
                                "p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer",
                                !n.isRead && "bg-primary-50/20"
                            )}
                            onClick={() => !n.isRead && handleMarkRead(n.id)}
                        >
                            <div className={cn("w-12 h-12 rounded-full shrink-0 flex items-center justify-center", getStyles(n.type))}>
                                {getIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-base font-bold text-slate-800">{n.title}</h3>
                                    {!n.isRead && (
                                        <span className="w-2.5 h-2.5 bg-primary-600 rounded-full shrink-0"></span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Clock size={12} />
                                        {format(new Date(n.createdAt), 'MMM dd, yyyy • hh:mm a')}
                                    </span>
                                    {n.isRead && (
                                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider flex items-center gap-1">
                                            <Check size={12} /> Read
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                        <Bell size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No notifications</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">
                        We'll let you know when something important happens!
                    </p>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
