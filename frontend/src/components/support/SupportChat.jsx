import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    X,
    Send,
    Bot,
    User,
    Loader2,
    MinusSquare,
    Trash2
} from 'lucide-react';
import { sendSupportMessage, clearSupportHistory, getSupportHistory } from '../../services/supportService';


const SupportChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 'initial', text: "Hi! I'm your Bit-task AI. How can I help you today? 👋", isBot: true }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch history when opened
    useEffect(() => {
        if (isOpen) {
            const fetchHistory = async () => {
                try {
                    const data = await getSupportHistory();
                    if (data.history && data.history.length > 0) {
                        const formatted = data.history.map(m => ({
                            id: m._id,
                            text: m.message,
                            isBot: m.role === 'ai'
                        }));
                        setMessages(formatted);
                    }
                } catch (err) {
                    console.error("Failed to load history:", err);
                }
            };
            fetchHistory();
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = { id: Date.now(), text: message, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await sendSupportMessage(message);
            // Fix: Backend returns 'message' key, not 'reply'
            const botMsg = { id: Date.now() + 1, text: response.message || response.reply, isBot: true };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Support chat error:", error);
            const status = error.response?.status;
            let errorText = "Sorry, I'm having trouble connecting to the server.";

            if (status === 401) {
                errorText = "Your session might have expired. Please log in again to use the assistant.";
            } else if (status === 404) {
                errorText = "The AI service endpoint was not found. Please check if the backend is updated.";
            } else if (!navigator.onLine) {
                errorText = "You appear to be offline. Please check your internet connection.";
            }

            const errorMsg = {
                id: Date.now() + 1,
                text: errorText,
                isBot: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = async () => {
        if (window.confirm("Clear all chat history?")) {
            try {
                await clearSupportHistory();
                setMessages([{ id: 1, text: "Chat history cleared. How can I help you today? 👋", isBot: true }]);
            } catch (err) {
                console.error("Failed to clear chat:", err);
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-colors ${isOpen ? 'bg-slate-200 text-slate-800' : 'bg-primary-600 text-white'
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>

            {/* Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-16 right-0 w-80 md:w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-primary-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Zen Support AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-xs text-primary-100">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleClearChat}
                                    title="Clear Chat"
                                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <MinusSquare size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`flex gap-2 max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.isBot ? 'bg-blue-100 text-blue-600' : 'bg-primary-100 text-primary-600'
                                            }`}>
                                            {msg.isBot ? <Bot size={16} /> : <User size={16} />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm whitespace-pre-line ${msg.isBot
                                            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-none border border-slate-100 dark:border-slate-700'
                                            : 'bg-primary-600 text-white rounded-tr-none shadow-md'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-2 max-w-[85%]">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <Bot size={16} />
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                                            <Loader2 size={14} className="animate-spin text-primary-500" />
                                            <span className="text-xs text-slate-400 italic">Zen AI is typing...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your question..."
                                    className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all dark:text-slate-200"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-600 hover:text-primary-700 disabled:text-slate-400 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-3">
                                Powered by ZenTask Dynamic Intelligence
                            </p>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupportChat;
