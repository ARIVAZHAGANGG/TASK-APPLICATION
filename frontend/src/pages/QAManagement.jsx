import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    Trash2, 
    Edit, 
    CircleHelp, 
    Users, 
    Shield, 
    CheckCircle2, 
    Loader2,
    Save,
    X,
    MessageSquare,
    Star
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const QAManagement = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        targetRole: 'all',
        category: 'general'
    });

    const roles = [
        { id: 'all', name: 'All Roles', icon: Users, color: 'slate' },
        { id: 'student', name: 'Students Only', icon: CheckCircle2, color: 'emerald' },
        { id: 'mentor', name: 'Mentors Only', icon: Shield, color: 'blue' },
        { id: 'admin', name: 'Admins Only', icon: Star, color: 'amber' },
    ];

    const fetchQuestions = async () => {
        try {
            const res = await api.get('/questions/manage');
            setQuestions(res.data);
        } catch (error) {
            toast.error("Failed to load questions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleOpenModal = (q = null) => {
        if (q) {
            setEditingQuestion(q);
            setFormData({
                question: q.question,
                answer: q.answer,
                targetRole: q.targetRole,
                category: q.category || 'general'
            });
        } else {
            setEditingQuestion(null);
            setFormData({
                question: '',
                answer: '',
                targetRole: 'all',
                category: 'general'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingQuestion) {
                await api.put(`/questions/${editingQuestion._id}`, formData);
                toast.success("Question updated");
            } else {
                await api.post('/questions', formData);
                toast.success("New question added");
            }
            setIsModalOpen(false);
            fetchQuestions();
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this question?")) return;
        try {
            await api.delete(`/questions/${id}`);
            toast.success("Deleted successfully");
            fetchQuestions();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const filteredQuestions = questions.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.targetRole.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <Loader2 className="animate-spin text-primary-500" size={48} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-primary-500/30">Intelligence Hub</h1>
                    <p className="text-slate-500 font-medium">Manage role-based Q&A and support documentation.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold" size={18} />
                        <input
                            type="text"
                            placeholder="Find intelligence..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="saas-input pl-12 h-12"
                        />
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-primary-600 text-white px-6 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-600/20 flex items-center gap-2 hover:scale-105 transition-all"
                    >
                        <Plus size={18} /> New Entry
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {filteredQuestions.map((q, idx) => (
                        <motion.div
                            key={q._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-primary-500/30 transition-all hover:shadow-2xl hover:shadow-primary-500/5"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border",
                                    q.targetRole === 'admin' ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800" :
                                    q.targetRole === 'mentor' ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800" :
                                    q.targetRole === 'student' ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800" :
                                    "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:border-slate-700"
                                )}>
                                    {q.targetRole.toUpperCase()}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(q)} className="p-2 text-slate-400 hover:text-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(q._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{q.question}</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed mb-6">{q.answer}</p>
                            
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mt-auto">
                                <MessageSquare size={12} />
                                Category: {q.category}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                    >
                        <form onSubmit={handleSubmit} className="p-10">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {editingQuestion ? 'Update Intelligence' : 'New Intelligence Entry'}
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Tactical Question</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.question}
                                        onChange={e => setFormData({...formData, question: e.target.value})}
                                        className="saas-input h-14"
                                        placeholder="What is your question?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Tactical Answer</label>
                                    <textarea 
                                        required
                                        value={formData.answer}
                                        onChange={e => setFormData({...formData, answer: e.target.value})}
                                        className="saas-input min-h-[120px] py-4 resize-none"
                                        placeholder="Provide a clear, tactical answer..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Target Role</label>
                                        <select 
                                            value={formData.targetRole}
                                            onChange={e => setFormData({...formData, targetRole: e.target.value})}
                                            className="saas-input h-14"
                                        >
                                            <option value="all">Everyone</option>
                                            <option value="student">Students</option>
                                            <option value="mentor">Mentors</option>
                                            <option value="admin">Admins</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Category</label>
                                        <input 
                                            type="text" 
                                            value={formData.category}
                                            onChange={e => setFormData({...formData, category: e.target.value})}
                                            className="saas-input h-14"
                                            placeholder="e.g. Tasks, XP"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button 
                                    type="submit"
                                    className="flex-1 bg-primary-600 text-white h-14 rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-xl shadow-primary-600/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-[0.98]"
                                >
                                    <Save size={18} /> {editingQuestion ? 'Update' : 'Deploy'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 h-14 bg-slate-50 dark:bg-slate-800 text-slate-500 font-black uppercase text-[12px] tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default QAManagement;
