import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { sendSupportMessage, getSupportHistory, clearSupportHistory } from '../../services/supportService';


const SupportMessagesTab = ({ context, initialQuery, onQueryHandled }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Handle initial query from other tabs
    useEffect(() => {
        if (initialQuery && !isLoading) {
            handleSend(null, initialQuery);
            onQueryHandled();
        }
    }, [initialQuery]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getSupportHistory();
                if (data.success && data.history.length > 0) {
                    setMessages(data.history.map(m => ({
                        id: m._id,
                        text: m.message,
                        isBot: m.role === 'ai'
                    })));
                } else {
                    setMessages([
                        { id: 'welcome', text: "Hi! I'm your Bit-task AI. How can I help you today? 👋", isBot: true }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
                setMessages([
                    { id: 'welcome', text: "Hi! I'm your Bit-task AI. How can I help you today? 👋", isBot: true }
                ]);
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e, overrideMessage = null) => {
        if (e) e.preventDefault();
        const textToSend = overrideMessage || message;
        if (!textToSend.trim() || isLoading) return;

        const userMsg = { id: Date.now(), text: textToSend, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        if (!overrideMessage) setMessage('');
        setIsLoading(true);

        try {
            const response = await sendSupportMessage(textToSend, context);
            const botMsg = {
                id: Date.now() + 1,
                text: response.message || response.reply || "I'm thinking, but I can't find my notes right now.",
                isBot: true
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Support chat error:", error);
            const errorMsg = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting. Please try again later.",
                isBot: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = async () => {
        if (window.confirm("Clear chat history?")) {
            try {
                await clearSupportHistory();
                setMessages([{ id: 'welcome', text: "Chat history cleared. How can I help you today? 👋", isBot: true }]);
            } catch (err) {
                console.error("Failed to clear chat:", err);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950/50">
            {/* Context/Actions Info Bar */}
            <div className="px-4 py-2 bg-white/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chat Session</span>
                <button
                    onClick={handleClear}
                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                    <Trash2 size={12} />
                    Clear Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                            <div className={`p-3 rounded-2xl text-sm ${msg.isBot
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
            </form>
        </div>
    );
};

export default SupportMessagesTab;
