import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';

const TaskChat = ({ taskId }) => {
    const { user } = useAuth();
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(!!taskId);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (taskId) {
            fetchMessages();
        }

        if (socket && taskId) {
            // Join the task room for real-time updates
            socket.emit('join_task', taskId);

            // Listen for new messages
            socket.on('new_message', (message) => {
                // Only add if not already in list (from our own send)
                setMessages(prev => {
                    if (prev.find(m => m._id === message._id || m.id === message.id)) return prev;
                    return [...prev, message];
                });
            });

            return () => {
                socket.emit('leave_task', taskId);
                socket.off('new_message');
            };
        }
    }, [taskId, socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/comments/${taskId}`);
            setMessages(res.data || []);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        try {
            setSending(true);
            const res = await api.post(`/comments/${taskId}`, { content: newMessage });
            setMessages(prev => [...prev, res.data]);
            setNewMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <Loader2 className="animate-spin mb-2" size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Loading Discussion...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-3">
                    <AlertCircle className="text-red-500" size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">Failed to load</p>
                <p className="text-[10px] lowercase mt-1 text-slate-400">{error}</p>
                <button onClick={fetchMessages} className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/10 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <MessageSquare size={16} />
                    </div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Activity & Discussion</h3>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase">{messages.length} Messages</span>
            </div>

            {/* Chat Messages */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
                            <MessageSquare size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">No messages yet</p>
                        <p className="text-[10px] lowercase mt-1 text-slate-400">Start the conversation about this task</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.userId?._id === user?.id || msg.userId?.id === user?.id;
                        return (
                            <div 
                                key={msg.id || msg._id || index}
                                className={cn(
                                    "flex flex-col gap-1.5 max-w-[85%]",
                                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    {!isMe && (
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {msg.userId?.name || 'Unknown'}
                                        </span>
                                    )}
                                    <span className="text-[9px] font-bold text-slate-300">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={cn(
                                    "px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed",
                                    isMe 
                                        ? "bg-slate-900 text-white dark:bg-primary-600 rounded-tr-none shadow-lg shadow-slate-900/5"
                                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div 
                className="p-4 bg-white/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 shrink-0"
            >
                <div className="relative">
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        placeholder="Type a message or @mention..."
                        className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl pr-14 text-sm font-medium outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all dark:text-white"
                        disabled={sending}
                    />
                    <button 
                        type="button"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="absolute right-2 top-2 bottom-2 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:bg-slate-300 text-white rounded-xl transition-all flex items-center justify-center"
                    >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskChat;
