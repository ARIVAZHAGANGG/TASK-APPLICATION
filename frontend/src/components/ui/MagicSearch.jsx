import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Command,
    LayoutDashboard,
    Trello,
    Calendar,
    Gamepad2,
    FileText,
    LogOut,
    ChevronRight,
    Loader2,
    X,
    Clock,
    CircleHelp,
    ListPlus,
    Users,
    ClipboardCheck,
    MessageSquare,
    Settings,
    Sun,
    Star,
    CheckCircle2,
    Columns
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MagicSearch = ({ isOpen, onClose, onNewBulkTask }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const role = user?.role || 'student';

    const getQuickActions = () => {
        const common = [
            { id: 'dash', title: 'Go to Dashboard', icon: LayoutDashboard, path: '/', color: 'text-blue-500' },
            { id: 'board', title: 'Task List Board', icon: Trello, path: '/board', color: 'text-sky-500' },
            { id: 'cal', title: 'View Calendar', icon: Calendar, path: '/calendar', color: 'text-pink-500' },
        ];

        const roleActions = {
            admin: [
                { id: 'users', title: 'User Management', icon: Users, path: '/users', color: 'text-indigo-500' },
                { id: 'assign', title: 'Assign New Task', icon: ListPlus, path: '/assign-task', color: 'text-violet-500' },
                { id: 'assigned', title: 'Track Assigned Tasks', icon: ClipboardCheck, path: '/assigned-tasks', color: 'text-emerald-500' },
                { id: 'oversight', title: 'Task Oversight', icon: Columns, path: '/system-tasks', color: 'text-indigo-500' },
            ],
            mentor: [
                { id: 'students', title: 'My Students', icon: Users, path: '/students', color: 'text-indigo-500' },
                { id: 'assign', title: 'Assign New Task', icon: ListPlus, path: '/assign-task', color: 'text-violet-500' },
                { id: 'assigned', title: 'Track Assigned Tasks', icon: ClipboardCheck, path: '/assigned-tasks', color: 'text-emerald-500' },
                { id: 'qa', title: 'Manage Q&A', icon: MessageSquare, path: '/manage-qa', color: 'text-orange-500' },
            ],
            student: [
                { id: 'day', title: 'My Day Focus', icon: Sun, path: '/my-day', color: 'text-amber-500' },
                { id: 'important', title: 'Important Tasks', icon: Star, path: '/important', color: 'text-rose-500' },
                { id: 'completed', title: 'Completed Missions', icon: CheckCircle2, path: '/completed', color: 'text-emerald-500' },
                { id: 'help', title: 'Q&A Center', icon: CircleHelp, path: '/help', color: 'text-teal-500' },
            ]
        };

        return [
            ...common,
            ...(roleActions[role] || []),
            { id: 'settings', title: 'System Settings', icon: Settings, path: '/settings', color: 'text-slate-500' },
            { id: 'logout', title: 'Sign Out', icon: LogOut, action: () => logout(), color: 'text-red-500' },
        ];
    };

    const quickActions = getQuickActions();

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleSearch = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // If query contains "help", show FAQs instead of just tasks
                if (query.toLowerCase().includes('help')) {
                    const faqs = [
                        { id: 'faq1', title: 'How to level up?', description: 'Complete tasks or focus sessions (+50 XP).', type: 'faq' },
                        { id: 'faq2', title: 'Magic Search keys?', description: 'Arrow keys to move, Enter to select, Esc to close.', type: 'faq' },
                        { id: 'faq3', title: 'Zen Arcade rewards?', description: '10% of game scores are converted to main XP.', type: 'faq' }
                    ];
                    setResults(faqs);
                } else {
                    const response = await api.get('/tasks', { params: { limit: 20 } });
                    const filtered = response.data.data.filter(task =>
                        task.title.toLowerCase().includes(query.toLowerCase()) ||
                        task.description?.toLowerCase().includes(query.toLowerCase())
                    ).slice(0, 5);
                    setResults(filtered);
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(handleSearch, 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            const totalItems = (query.trim() ? results.length : quickActions.length);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % totalItems);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleAction(query.trim() ? results[selectedIndex] : quickActions[selectedIndex]);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, selectedIndex, results, query]);

    const handleAction = (item) => {
        if (!item) return;

        onClose();
        if (item.action) {
            item.action();
        } else if (item.path) {
            navigate(item.path);
        } else if (item.type === 'faq') {
            navigate('/help');
        } else if (item.id) { // Task ID
            navigate(`/tasks`); // For now, go to tasks page
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[101] overflow-hidden border border-slate-200 dark:border-slate-800"
                    >
                        {/* Search Input Area */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                                {loading ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search tasks, actions, or jump to..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent text-xl font-medium outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
                            />
                            <div className="flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 uppercase">ESC</kbd>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Results / Suggestions */}
                        <div className="max-h-[400px] overflow-y-auto p-3 custom-scrollbar">
                            {!query.trim() ? (
                                <div>
                                    <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</p>
                                    <div className="space-y-1">
                                        {quickActions.map((action, idx) => (
                                            <button
                                                key={action.id}
                                                onMouseEnter={() => setSelectedIndex(idx)}
                                                onClick={() => handleAction(action)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${selectedIndex === idx
                                                    ? 'bg-primary-50 dark:bg-primary-900/20 translate-x-1'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm transition-transform group-hover:scale-110 ${action.color}`}>
                                                    <action.icon size={20} />
                                                </div>
                                                <span className="flex-1 text-left font-bold text-slate-700 dark:text-slate-200">{action.title}</span>
                                                <ChevronRight size={18} className={`text-slate-300 transition-all ${selectedIndex === idx ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : results.length > 0 ? (
                                <div>
                                    <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {query.toLowerCase().includes('help') ? 'Instant Intelligence (FAQ)' : 'Task Missions Found'}
                                    </p>
                                    <div className="space-y-1">
                                        {results.map((task, idx) => (
                                            <button
                                                key={task.id}
                                                onMouseEnter={() => setSelectedIndex(idx)}
                                                onClick={() => handleAction(task)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${selectedIndex === idx
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 translate-x-1'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-blue-500">
                                                    {task.type === 'faq' ? <CircleHelp size={20} className="text-teal-500" /> : <Clock size={20} />}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="font-bold text-slate-700 dark:text-slate-200">{task.title}</p>
                                                    <p className="text-xs text-slate-400 truncate max-w-[400px]">{task.description || 'No briefing available'}</p>
                                                </div>
                                                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm ${task.priority === 'high' ? 'bg-red-50 text-red-500' :
                                                    task.priority === 'medium' ? 'bg-amber-50 text-amber-500' :
                                                        'bg-green-50 text-green-500'
                                                    }`}>
                                                    {task.priority}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center opacity-50">
                                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                                        <Command size={40} className="text-slate-400" />
                                    </div>
                                    <p className="font-bold text-slate-500">No missions found matching "{query}"</p>
                                    <p className="text-sm text-slate-400">Try searching for other keywords...</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded shadow-sm">Enter</kbd> to select</span>
                                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded shadow-sm">↑↓</kbd> to navigate</span>
                            </div>
                            <span className="text-primary-500">Zen Magic Search v2.0</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MagicSearch;
