import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CircleHelp,
    Book,
    Star,
    Gamepad2,
    BarChart3,
    Settings,
    Search,
    ChevronRight,
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 

const HelpCenter = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await api.get('/questions');
                const dynamicFaqs = res.data.map(q => ({
                    category: q.category || 'general',
                    q: q.question,
                    a: q.answer
                }));
                
                // Keep some default ones if none are found or combine them?
                // For now, let's just use dynamic ones as requested.
                setFaqs(dynamicFaqs);
            } catch (error) {
                console.error("Failed to fetch FAQs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const categories = [
        { id: 'all', name: 'All Topics', icon: Book },
        { id: 'tasks', name: 'Task Management', icon: CheckCircle2 },
        { id: 'dashboard', name: 'Dashboard & Stats', icon: BarChart3 },
        { id: 'settings', name: 'App Settings', icon: Settings },
        { id: 'security', name: 'Security & Privacy', icon: Shield },
        { id: 'general', name: 'General Intelligence', icon: CircleHelp },
    ];

    const filteredFaqs = faqs.filter(faq => {
        const matchesTab = activeTab === 'all' || faq.category === activeTab;
        const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.a.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-6 lg:p-10 animate-fade-in">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold text-sm mb-6 transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    BACK TO MISSION
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                            How can we <span className="text-primary-600">Help?</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 font-medium max-w-xl">
                            Search our tactical documentation or browse categories to master your Bit-task workspace.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96 px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-primary-500/5 border border-slate-200 dark:border-slate-700 flex items-center gap-3 group focus-within:ring-2 ring-primary-500/20 transition-all">
                        <Search className="text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search FAQ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent outline-none flex-1 text-slate-700 dark:text-slate-200 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-5xl mx-auto mb-10 overflow-x-auto no-scrollbar pb-2">
                <div className="flex gap-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap font-bold transition-all ${activeTab === cat.id
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20 scale-105'
                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-800'
                                }`}
                        >
                            <cat.icon size={18} />
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* FAQ Grid */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                <AnimatePresence mode="popLayout">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, idx) => (
                            <motion.div
                                key={idx}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-primary-500 mb-6 group-hover:scale-110 transition-transform">
                                    <CircleHelp size={24} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4 leading-tight group-hover:text-primary-600 transition-colors">
                                    {faq.q}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                    {faq.a}
                                </p>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-50">
                            <Book size={64} className="text-slate-300 mb-4" />
                            <h3 className="text-2xl font-black text-slate-500">No Intelligence Found</h3>
                            <p className="text-slate-400 font-medium">Try searching for broader keywords like 'task' or 'XP'.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Support */}
            <div className="max-w-5xl mx-auto bg-slate-900 dark:bg-primary-600 rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative shadow-2xl shadow-primary-500/10">
                <div className="absolute top-0 right-0 p-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl lg:block hidden"></div>
                <div className="relative z-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Still need tactical support?</h2>
                    <p className="text-slate-300 dark:text-white/80 font-bold text-lg max-w-md">
                        Our intelligence unit is always ready to assist you with complex mission planning.
                    </p>
                </div>
                <button className="relative z-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    Contact Commander
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default HelpCenter;
