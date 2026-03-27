import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Loader2, AlertCircle, Bot, X, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';

const ChatWindow = ({ recipientId, recipientName, onClose }) => {
    const { user } = useAuth();
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (recipientId) {
            fetchMessages();
        }

        if (socket && user?.id) {
            // Join personal chat room
            socket.emit('join_chat', user.id);

            // Listen for private messages
            socket.on('private_message', (message) => {
                // Check if the message is from or to the current recipient
                if (
                    (message.senderId === recipientId && message.receiverId === user.id) ||
                    (message.senderId === user.id && message.receiverId === recipientId)
                ) {
                    setMessages(prev => {
                        // Avoid duplicates
                        const msgId = message.id || message._id;
                        if (prev.find(m => (m.id || m._id) === msgId)) return prev;
                        return [...prev, message];
                    });
                }
            });

            // Listen for deleted messages
            socket.on('message_deleted', ({ messageId }) => {
                setMessages(prev => prev.filter(m => (m.id || m._id) !== messageId));
            });

            return () => {
                socket.off('private_message');
                socket.off('message_deleted');
            };
        }
    }, [recipientId, socket, user?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/chat/history/${recipientId}`);
            setMessages(res.data.history || []);
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
            setError(error.response?.data?.message || 'Failed to load conversation');
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
            const res = await api.post('/chat/send', {
                receiverId: recipientId,
                content: newMessage,
                type: 'direct'
            });
            // Socket will handle adding the message to state for both sides
            // But we add it here for instant feedback if socket is slow
            setMessages(prev => {
                const msgId = res.data.message.id || res.data.message._id;
                if (prev.find(m => (m.id || m._id) === msgId)) return prev;
                return [...prev, res.data.message];
            });
            setNewMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm("Delete this message?")) return;

        try {
            await api.delete(`/chat/${messageId}`);
            setMessages(prev => prev.filter(m => (m.id || m._id) !== messageId));
            toast.success("Message deleted");
        } catch (error) {
            toast.error("Failed to delete message");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] opacity-50">
                <Loader2 className="animate-spin mb-2 text-primary-500" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">Securing Connection...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center">
                        <User size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{recipientName}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Mission</span>
                        </div>
                    </div>
                </div>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-20">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                            <MessageSquare className="text-slate-300" size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Transmission Start</p>
                        <p className="text-[10px] lowercase mt-1 text-slate-400">Establish communication with {recipientName}</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === user?.id || (msg.senderId?._id === user?.id) || (msg.senderId?.id === user?.id);
                        const canDelete = isMe || user?.role === 'admin';
                        const msgId = msg.id || msg._id;

                        return (
                            <div 
                                key={msgId || index}
                                className={cn(
                                    "flex flex-col gap-1.5 max-w-[80%] group",
                                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                                )}
                            >
                                <div className="flex items-center gap-2 max-w-full">
                                    {isMe && canDelete && (
                                        <button 
                                            onClick={() => handleDeleteMessage(msgId)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <div className={cn(
                                        "px-4 py-3 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm transition-all",
                                        isMe 
                                            ? cn(
                                                "text-white rounded-tr-none",
                                                user?.role === 'admin' ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/20" :
                                                user?.role === 'mentor' ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20" :
                                                "bg-gradient-to-br from-blue-600 to-blue-500 shadow-blue-500/20"
                                              )
                                            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700"
                                    )}>
                                        {msg.content}
                                    </div>
                                    {!isMe && canDelete && (
                                        <button 
                                            onClick={() => handleDeleteMessage(msgId)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <span className="text-[9px] font-bold text-slate-300 px-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <form 
                onSubmit={handleSendMessage}
                className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0"
            >
                <div className="relative">
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl pr-14 text-sm font-medium outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all dark:text-white"
                        disabled={sending}
                    />
                    <button 
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="absolute right-2 top-2 bottom-2 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:bg-slate-300 text-white rounded-xl transition-all flex items-center justify-center shadow-lg shadow-primary-500/20"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;

