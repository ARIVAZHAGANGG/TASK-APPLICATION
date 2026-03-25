import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
    MessageCircle,
    X,
    Home,
    MessageSquare,
    CircleHelp,
    CheckSquare,
    Search,
    ChevronDown,
    Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyTasks } from '../../services/taskService';
import { clearSupportHistory } from '../../services/supportService';
import SupportHome from './SupportHome';

import SupportMessagesTab from './SupportMessagesTab';
import SupportHelp from './SupportHelp';
import SupportTasks from './SupportTasks';

const SupportAssistant = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [tasks, setTasks] = useState([]);
    const [hasUnread, setHasUnread] = useState(true);
    const [pendingQuery, setPendingQuery] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchTasks();
            setHasUnread(false);
        }
    }, [isOpen]);

    const fetchTasks = async () => {
        try {
            const res = await getMyTasks();
            setTasks(res.data);
        } catch (error) {
            console.error("Error fetching tasks for support:", error);
        }
    };

    const handleQuickAction = (query) => {
        setPendingQuery(query);
        setActiveTab('messages');
    };

    const handleClearHistory = async () => {
        if (window.confirm("Clear all AI chat history? This cannot be undone.")) {
            try {
                await clearSupportHistory();
                // We'll trigger a refresh by switching tabs or similar, 
                // but better yet, we can passing a refresh trigger to SupportMessagesTab
                setPendingQuery(null);
                setActiveTab('messages');
                // Force a re-mount of the messages tab
                setActiveTab('home');
                setTimeout(() => setActiveTab('messages'), 10);
            } catch (error) {
                console.error("Failed to clear history:", error);
            }
        }
    };

    const tabs = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'messages', icon: MessageSquare, label: 'Messages' },
        { id: 'help', icon: CircleHelp, label: 'Help' },
        { id: 'tasks', icon: CheckSquare, label: 'Tasks' }
    ];

    const renderContent = () => {
        const context = {
            page: location.pathname,
            title: document.title
        };

        switch (activeTab) {
            case 'home':
                return <SupportHome userName={user?.name || 'User'} onSearch={handleQuickAction} />;
            case 'messages':
                return (
                    <SupportMessagesTab
                        context={context}
                        initialQuery={pendingQuery}
                        onQueryHandled={() => setPendingQuery(null)}
                    />
                );
            case 'help':
                return <SupportHelp onSelectQuestion={handleQuickAction} />;
            case 'tasks':
                return <SupportTasks tasks={tasks} />;
            default:
                return <SupportHome userName={user?.name || 'User'} />;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 relative bg-gradient-to-br from-primary-500 to-primary-700 text-white`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}

                {!isOpen && hasUnread && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </motion.button>

            {/* Support Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.9 }}
                        className="absolute bottom-20 right-0 w-[380px] h-[550px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                        All Systems Operational
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeTab === 'messages' && (
                                        <button
                                            onClick={handleClearHistory}
                                            title="Clear Chat History"
                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <ChevronDown size={20} className="text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {renderContent()}
                        </div>

                        {/* Bottom Navigation */}
                        <div className="p-3 bg-white/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${isActive
                                            ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/10'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="text-[10px] font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupportAssistant;
