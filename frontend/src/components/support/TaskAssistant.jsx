import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot,
    X,
    Send,
    Loader2,
    Maximize2,
    Minimize2,
    GripVertical,
    BarChart3,
    Search,
    ShieldCheck
} from 'lucide-react';
import { askTaskAssistant } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';

const TaskAssistant = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 'initial', text: `Greetings, ${user?.name}. I am your BitTask Intelligence Module. I have access to current task distribution and performance metrics. How can I assist your oversight today?`, isBot: true }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = { id: Date.now(), text: message, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await askTaskAssistant(message);
            const botMsg = { id: Date.now() + 1, text: response.message, isBot: true };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Task Assistant error:", error);
            const botMsg = { id: Date.now() + 1, text: "I encountered an error querying the intelligence database. Please try again later.", isBot: true };
            setMessages(prev => [...prev, botMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // Only allow Mentors and Admins
    if (user?.role !== 'admin' && user?.role !== 'mentor') return null;

    return (
        <div className="fixed bottom-24 right-6 z-[60]">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl shadow-2xl flex items-center justify-center border-2 border-white/20 relative"
                    >
                        <Bot size={28} />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        drag
                        dragMomentum={false}
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 100 }}
                        className={`bg-white dark:bg-slate-900 shadow-2xl rounded-[32px] border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-20 w-72' : 'h-[550px] w-96'
                            }`}
                    >
                        {/* Draggable Header */}
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between cursor-move touch-none overflow-hidden relative group">
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="p-2 bg-indigo-500/20 rounded-xl">
                                    <ShieldCheck size={20} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm tracking-tight uppercase">Task Intelligence</h3>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                        Administrative Access
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 relative z-10">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-colors"
                                >
                                    <X size={16} />
                                </button>
                                <div className="ml-1 opacity-20">
                                    <GripVertical size={20} />
                                </div>
                            </div>
                            
                            {/* Decorative line */}
                            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 w-full opacity-50" />
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div className={`flex gap-3 max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${msg.isBot
                                                        ? 'bg-slate-900 border-slate-700 text-indigo-400'
                                                        : 'bg-indigo-600 border-indigo-500 text-white'
                                                    }`}>
                                                    {msg.isBot ? <BarChart3 size={14} /> : <Search size={14} />}
                                                </div>
                                                <div className={`p-4 rounded-2xl text-[13px] leading-relaxed font-medium shadow-sm border whitespace-pre-line ${msg.isBot
                                                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-700'
                                                        : 'bg-indigo-600 text-white border-indigo-500'
                                                    }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="flex gap-3 max-w-[85%] items-center">
                                                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-indigo-400 flex items-center justify-center shadow-sm">
                                                    <Loader2 size={14} className="animate-spin" />
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleSend} className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Query task intelligence..."
                                            className="w-full pl-5 pr-14 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-200 placeholder:text-slate-400"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!message.trim() || isLoading}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:bg-slate-400 group-hover:scale-105"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-center text-slate-400 mt-4 font-black uppercase tracking-widest">
                                        Task Intelligence System v1.0 • Administrative Oversight
                                    </p>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TaskAssistant;
