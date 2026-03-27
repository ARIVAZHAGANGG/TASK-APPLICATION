import { useState, useEffect } from "react";
import { Search, Loader2, User as UserIcon, Send, Mail, Award, BookOpen, MoreVertical, Shield, MessageSquare, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";

const MentorList = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                // We fetch from /admin/staff and filter for mentors
                const res = await api.get("/admin/staff");
                const mentorUsers = res.data.filter(user => user.role === 'mentor');
                setMentors(mentorUsers);
            } catch (error) {
                toast.error("Failed to load mentor registry");
            } finally {
                setLoading(false);
            }
        };
        fetchMentors();
    }, []);

    const filteredMentors = mentors.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.staffId && m.staffId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary-500" size={48} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-primary-500/30">Mentor Registry</h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">Manage and view performance of your registered mentors.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold" size={18} />
                        <input
                            type="text"
                            placeholder="Find by name, email or Staff ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="saas-input pl-12 h-11 sm:h-12 text-sm"
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {filteredMentors.length > 0 ? filteredMentors.map((mentor, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={mentor.id || mentor._id}
                        className="bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-primary-500/30 transition-all hover:shadow-2xl hover:shadow-primary-500/5"
                    >
                        {/* Status Bar */}
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                             <div className="h-full bg-primary-500 w-[75%]" />
                        </div>

                        <div className="p-5 sm:p-8">
                            <div className="flex items-start justify-between relative z-10 mb-4 sm:mb-6">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-[24px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                        {mentor.avatar ? (
                                            <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon size={24} className="sm:size-7" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs sm:text-sm tracking-tight truncate">{mentor.name}</h3>
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mt-0.5">Verified Mentor</p>
                                    </div>
                                </div>
                                <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800">
                                    Active
                                </div>
                            </div>

                            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Mail size={12} className="text-slate-300 sm:size-3.5" />
                                    <span className="text-[11px] sm:text-xs font-bold truncate">{mentor.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Shield size={12} className="text-slate-300 sm:size-3.5" />
                                    <span className="text-[11px] sm:text-xs font-bold truncate">Staff ID: {mentor.staffId}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Award size={12} className="text-slate-300 sm:size-3.5" />
                                    <span className="text-[11px] sm:text-xs font-bold">Member Since: {new Date(mentor.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <button 
                                    onClick={() => navigate(`/mentors/${mentor._id || mentor.id}`)}
                                    className="flex items-center justify-center gap-1 py-2.5 sm:py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-wide hover:bg-primary-600 hover:shadow-lg transition-all"
                                >
                                    <Eye size={11} className="sm:size-3" /> Profile
                                </button>
                                <button 
                                    onClick={() => navigate(`/report?mentorId=${mentor._id}`)}
                                    className="flex items-center justify-center gap-1 py-2.5 sm:py-3 bg-slate-700 dark:bg-slate-700 text-white rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-wide hover:bg-slate-600 transition-all"
                                >
                                    <BookOpen size={11} className="sm:size-3" /> Stats
                                </button>
                                <button 
                                    onClick={() => navigate(`/messages?userId=${mentor.id || mentor._id}&userName=${encodeURIComponent(mentor.name)}`)}
                                    className="flex items-center justify-center gap-1 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-wide hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    <MessageSquare size={11} className="sm:size-3" /> Chat
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Shield size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Mentors Found</h3>
                        <p className="text-slate-500 mt-2 font-medium">Refine your search parameters to find the mentor.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentorList;
