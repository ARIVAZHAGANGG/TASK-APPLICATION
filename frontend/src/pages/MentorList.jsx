import { useState, useEffect } from "react";
import { Search, Loader2, User as UserIcon, Send, Mail, Award, BookOpen, MoreVertical, Shield, MessageSquare, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";
import { useOnlineUsers } from "../context/SocketContext";
import { cn } from "../utils/cn";
import { motion, AnimatePresence } from "framer-motion";

const MentorList = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingMentor, setEditingMentor] = useState(null);
    const [departmentInput, setDepartmentInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const onlineUsersList = useOnlineUsers() || [];
    const navigate = useNavigate();

    const openEditModal = (mentor) => {
        setEditingMentor(mentor);
        setDepartmentInput(mentor.department || "");
    };

    const handleUpdateDepartment = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/admin/staff/${editingMentor._id || editingMentor.id}/department`, { department: departmentInput });
            toast.success("Mentor department updated successfully");
            setEditingMentor(null);
            
            const res = await api.get("/admin/staff");
            const mentorUsers = res.data.filter(user => user.role === 'mentor');
            setMentors(mentorUsers);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update department");
        } finally {
            setSubmitting(false);
        }
    };

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

                        <div className="p-4 sm:p-5">
                            <div className="flex items-start justify-between relative z-10 mb-4 sm:mb-6 gap-2 w-full overflow-hidden">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-[20px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex-shrink-0">
                                        {mentor.avatar ? (
                                            <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon size={24} className="sm:size-6" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs sm:text-sm tracking-tight whitespace-normal line-clamp-2 pr-1" title={mentor.name}>{mentor.name}</h3>
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mt-0.5">Verified Mentor</p>
                                    </div>
                                </div>
                                {onlineUsersList.includes(mentor.id || mentor._id) ? (
                                    <div className="flex-shrink-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] border-2 border-white dark:border-slate-900" title="Online"></div>
                                ) : (
                                    <div className="flex-shrink-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] border-2 border-white dark:border-slate-900" title="Offline"></div>
                                )}
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
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                <button 
                                    onClick={() => navigate(`/mentors/${mentor._id || mentor.id}`)}
                                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:shadow-lg transition-all"
                                >
                                    <Eye size={12} className="sm:size-3.5" /> Profile
                                </button>
                                <button 
                                    onClick={() => navigate(`/messages?userId=${mentor.id || mentor._id}&userName=${encodeURIComponent(mentor.name)}`)}
                                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    <MessageSquare size={12} className="sm:size-3.5" /> Chat
                                </button>
                                <button 
                                    onClick={() => navigate(`/report?mentorId=${mentor._id}`)}
                                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 bg-slate-700 dark:bg-slate-700 text-white rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-slate-600 transition-all"
                                >
                                    <BookOpen size={11} className="sm:size-3" /> Stats
                                </button>
                                <button 
                                    onClick={() => openEditModal(mentor)} 
                                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all font-bold"
                                >
                                    <Shield size={11} className="sm:size-3" /> Edit Profile
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
            {/* Edit Department Modal */}
            <AnimatePresence>
                {editingMentor && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => !submitting && setEditingMentor(null)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
                        >
                            <div className="mb-6">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Edit Profile</h2>
                                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Configure institutional department.</p>
                            </div>
                            
                            <form onSubmit={handleUpdateDepartment} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Department Name</label>
                                    <div className="relative">
                                        <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={departmentInput}
                                            onChange={(e) => setDepartmentInput(e.target.value)}
                                            placeholder="e.g. Computer Science"
                                            className="w-full pl-11 pr-4 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 text-sm sm:text-base transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingMentor(null)}
                                        disabled={submitting}
                                        className="flex-1 py-3 sm:py-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-xl sm:rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] py-3 sm:py-4 bg-primary-500 text-white font-black rounded-xl sm:rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 font-bold"
                                    >
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MentorList;
