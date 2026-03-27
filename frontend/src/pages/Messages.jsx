import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, 
    Search, 
    User, 
    Shield, 
    Users, 
    ArrowLeft, 
    Loader2, 
    Send,
    Bot,
    MoreVertical,
    CheckCircle2
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/chat/ChatWindow';
import { cn } from '../utils/cn';

const Messages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialRecipientId = searchParams.get('userId');
    const initialRecipientName = searchParams.get('userName');

    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState(
        initialRecipientId ? { id: initialRecipientId, name: initialRecipientName || 'User' } : null
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    useEffect(() => {
        const fetchInitialUsers = async () => {
            try {
                setIsLoadingUsers(true);
                // Fetch mentors and students for the registry list
                const [mentorsRes, studentsRes] = await Promise.all([
                    api.get("/admin/staff?role=mentor"),
                    api.get("/admin/students")
                ]);
                const combined = [
                    ...(mentorsRes.data || []),
                    ...(studentsRes.data || [])
                ].filter(u => u.id !== user.id && u._id !== user.id);
                setAllUsers(combined);
            } catch (err) {
                console.error("Failed to fetch registry:", err);
            } finally {
                setIsLoadingUsers(false);
            }
        };
        fetchInitialUsers();
    }, [user.id]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchTerm.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await api.get(`/chat/users/search?q=${encodeURIComponent(searchTerm)}`);
                setSearchResults(res.data.users || []);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const res = await api.get('/chat/conversations');
            setConversations(res.data.conversations || []);
            
            // If we have an initial recipient but no name, try to find it in conversations
            if (initialRecipientId && !initialRecipientName) {
                const existing = res.data.conversations.find(c => c.user.id === initialRecipientId);
                if (existing) {
                    setSelectedChat({ id: existing.user.id, name: existing.user.name });
                }
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConversations = conversations.filter(c => 
        c.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-8rem)] max-w-7xl mx-auto flex gap-0 md:gap-6 p-0 md:p-6 overflow-hidden bg-white dark:bg-slate-950 md:bg-transparent">
            {/* Sidebar: Conversation List (Hidden on mobile if chat is selected) */}
            <div className={cn(
                "w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-slate-900 md:rounded-[2.5rem] border-r md:border border-slate-200 dark:border-slate-800 shrink-0 overflow-hidden shadow-sm transition-all",
                selectedChat && "hidden md:flex"
            )}>
                {/* Search Header */}
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-3">
                        <MessageSquare className={cn(
                            user?.role === 'admin' ? "text-rose-500" :
                            user?.role === 'mentor' ? "text-indigo-500" :
                            "text-primary-500"
                        )} size={24} />
                        Intelligence Hub
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Find transmission..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-50">
                            <Loader2 className="animate-spin mb-2 text-primary-500" size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Scanning Waves...</span>
                        </div>
                    ) : (filteredConversations.length === 0 && searchResults.length === 0 && !isSearching && searchTerm.length < 2) ? (
                        <div className="space-y-4">
                            <h3 className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Personnel Registry</h3>
                            {isLoadingUsers ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary-500" size={20} /></div>
                            ) : (
                                allUsers.map((u) => (
                                    <button
                                        key={u._id || u.id}
                                        onClick={() => setSelectedChat({ id: u._id || u.id, name: u.name })}
                                        className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 group"
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 group-hover:border-primary-500/30">
                                                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-2xl" /> : <User size={20} />}
                                            </div>
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <h4 className="text-xs font-black uppercase tracking-tight truncate text-slate-900 dark:text-white">{u.name}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{u.role || 'Personnel'}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {/* Render registry search results if searching */}
                            {searchTerm.length >= 2 && (
                                <div className="mb-4">
                                    <h3 className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                                        Registry Matches
                                        {isSearching && <Loader2 size={12} className="animate-spin" />}
                                    </h3>
                                    {searchResults.map((u) => (
                                        <button
                                            key={u._id || u.id}
                                            onClick={() => {
                                                setSelectedChat({ id: u._id || u.id, name: u.name });
                                                setSearchTerm('');
                                            }}
                                            className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                                        >
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400">
                                                    {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-2xl" /> : <User size={20} />}
                                                </div>
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="text-xs font-black uppercase tracking-tight truncate text-slate-900 dark:text-white">
                                                        {u.name}
                                                    </h4>
                                                </div>
                                                <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate uppercase">
                                                    {u.role}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                    {searchResults.length === 0 && !isSearching && (
                                        <p className="text-[10px] font-bold text-center text-slate-400 py-4 uppercase tracking-widest">No personnel found</p>
                                    )}
                                </div>
                            )}

                            {/* Existing filtered conversations */}
                            {filteredConversations.length > 0 && (
                                <>
                                    {searchTerm.length >= 2 && (
                                        <h3 className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                                            Active Links
                                        </h3>
                                    )}
                                    {filteredConversations.map((conv) => (
                                        <button
                                            key={conv.user.id}
                                            onClick={() => setSelectedChat({ id: conv.user.id, name: conv.user.name })}
                                            className={cn(
                                                "w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all group",
                                                selectedChat?.id === conv.user.id 
                                                    ? cn(
                                                        "shadow-xl scale-[1.02] z-10 text-white",
                                                        user?.role === 'admin' ? "bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-500/20" :
                                                        user?.role === 'mentor' ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-500/20" :
                                                        "bg-gradient-to-r from-blue-600 to-blue-400 shadow-blue-500/20"
                                                    )
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                                            )}
                                        >
                                            <div className="relative shrink-0">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 transition-colors border",
                                                    selectedChat?.id === conv.user.id 
                                                        ? "bg-white/10 border-white/20 text-white" 
                                                        : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 group-hover:border-primary-500/30"
                                                )}>
                                                    {conv.user.avatar ? (
                                                        <img src={conv.user.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                {!conv.isRead && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 border-2 border-white dark:border-slate-900 rounded-full animate-bounce"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className={cn(
                                                        "text-xs font-black uppercase tracking-tight truncate",
                                                        selectedChat?.id === conv.user.id ? "text-white" : "text-slate-900 dark:text-white"
                                                    )}>
                                                        {conv.user.name}
                                                    </h4>
                                                    <span className={cn(
                                                        "text-[9px] font-bold",
                                                        selectedChat?.id === conv.user.id ? "text-white/60" : "text-slate-400"
                                                    )}>
                                                        {new Date(conv.timestamp).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className={cn(
                                                    "text-[10px] font-medium truncate mt-0.5",
                                                    selectedChat?.id === conv.user.id ? "text-white/80" : "text-slate-500"
                                                )}>
                                                    {conv.lastMessage}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/20 md:rounded-[2.5rem] overflow-hidden transition-all",
                !selectedChat && "hidden md:flex"
            )}>
                <AnimatePresence mode="wait">
                    {selectedChat ? (
                        <motion.div 
                            key={selectedChat.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col"
                        >
                            <ChatWindow 
                                recipientId={selectedChat.id} 
                                recipientName={selectedChat.name}
                                onClose={window.innerWidth < 768 ? () => setSelectedChat(null) : null}
                            />
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center text-center p-10"
                        >
                            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center mb-6 text-primary-500 relative">
                                <div className="absolute inset-0 bg-primary-500/5 rounded-[2.5rem] animate-pulse"></div>
                                <MessageSquare size={48} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Initialize Frequency</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                                Select a conversation from the tactical hub or start a new transmission from the registry.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Messages;
