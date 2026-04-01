import { useState, useEffect } from "react";
import { Users, Search, Filter, Shield, MoreVertical, Loader2, User as UserIcon, Send, Mail, MapPin, Award, BookOpen, ListTodo, X, Save, RefreshCw, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";
import { useOnlineUsers } from "../context/SocketContext";
import { cn } from "../utils/cn";
import { motion, AnimatePresence } from "framer-motion";

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const onlineUsersList = useOnlineUsers() || [];
    
    // Modal state
    const [editingStudent, setEditingStudent] = useState(null);
    const [departmentInput, setDepartmentInput] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await api.get("/admin/students");
                setStudents(res.data);
            } catch (error) {
                toast.error("Failed to load student registry");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openEditModal = (student) => {
        setEditingStudent(student);
        setDepartmentInput(student.department || "");
    };

    const handleUpdateDepartment = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/admin/students/${editingStudent._id || editingStudent.id}/department`, { department: departmentInput });
            toast.success("Student department updated successfully");
            setEditingStudent(null);
            
            // Refresh students
            const res = await api.get("/admin/students");
            setStudents(res.data);
        } catch (error) {
            console.error("Update Department Error Details:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to update department");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary-500" size={48} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-primary-500/30">Registry</h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">Manage and assign objectives to your students.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold" size={18} />
                        <input
                            type="text"
                            placeholder="Find by name or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="saas-input pl-12 h-11 sm:h-12 text-sm"
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {filteredStudents.length > 0 ? filteredStudents.map((student, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={student.id || student._id}
                        className="bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-primary-500/30 transition-all hover:shadow-2xl hover:shadow-primary-500/5"
                    >
                         <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                             <div className="h-full bg-primary-500" style={{ width: `${Math.min(student.productivityScore || student.calculatedProductivityScore || 0, 100)}%` }} />
                         </div>

                        <div className="p-4 sm:p-5">
                            <div className="flex items-start justify-between relative z-10 mb-4 sm:mb-6 gap-2 w-full overflow-hidden">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-[20px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex-shrink-0">
                                        {student.avatar ? (
                                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon size={24} className="sm:size-6" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs sm:text-sm tracking-tight whitespace-normal line-clamp-2 pr-1" title={student.name}>{student.name}</h3>
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mt-0.5">Verified Student</p>
                                    </div>
                                </div>
                                {onlineUsersList.includes(student.id || student._id) ? (
                                    <div className="flex-shrink-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] border-2 border-white dark:border-slate-900" title="Online"></div>
                                ) : (
                                    <div className="flex-shrink-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] border-2 border-white dark:border-slate-900" title="Offline"></div>
                                )}
                            </div>

                            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Mail size={12} className="text-slate-300 sm:size-3.5" />
                                    <span className="text-[11px] sm:text-xs font-bold truncate">{student.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <BookOpen size={12} className="text-slate-300 sm:size-3.5" />
                                    <span className="text-[11px] sm:text-xs font-bold truncate">Course: {student.department || 'Computer Science'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Award size={12} className="text-emerald-500 sm:size-3.5" />
                                    <span className="text-[11px] sm:text-xs font-bold">
                                        Productivity: {student.productivityScore ?? student.calculatedProductivityScore ?? '–'}%
                                    </span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                <button 
                                    onClick={() => navigate(`/assign-task?studentId=${student.id || student._id}`)}
                                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:shadow-lg transition-all"
                                >
                                    <Send size={12} className="sm:size-3.5" /> Objective
                                </button>
                                <button 
                                    onClick={() => navigate(`/messages?userId=${student.id || student._id}&userName=${encodeURIComponent(student.name)}`)}
                                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3.5 bg-blue-600 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    <MessageSquare size={12} className="sm:size-3.5" /> Chat
                                </button>
                                <button 
                                    onClick={() => navigate(`/tasks?userId=${student.id || student._id}`)}
                                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 bg-primary-500 text-white rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-sm"
                                >
                                    <ListTodo size={11} className="sm:size-3" /> View Tasks
                                </button>
                                <button 
                                    onClick={() => openEditModal(student)} 
                                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all"
                                >
                                    <BookOpen size={11} className="sm:size-3" /> Edit Profile
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Users size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Personnel Matches</h3>
                        <p className="text-slate-500 mt-2 font-medium">Refine your search parameters to find the student.</p>
                    </div>
                )}
            </div>

            {/* Edit Department Modal */}
            <AnimatePresence>
                {editingStudent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => !submitting && setEditingStudent(null)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] sm:rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
                        >
                            <div className="flex items-center justify-between mb-6 sm:mb-8">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Edit Setup</h2>
                                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">For {editingStudent.name}</p>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => !submitting && setEditingStudent(null)} 
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400"
                                    disabled={submitting}
                                >
                                    <X size={20} className="sm:size-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateDepartment}>
                                <div className="space-y-5 sm:space-y-6">
                                    <div>
                                        <label className="block text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Department / Course Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={departmentInput}
                                            onChange={e => setDepartmentInput(e.target.value)}
                                            className="saas-input h-12 sm:h-14 font-medium text-sm"
                                            placeholder="e.g. Computer Science..."
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 sm:mt-8 flex flex-col gap-3">
                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-primary-600 text-white h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black uppercase text-[11px] sm:text-[12px] tracking-widest shadow-xl shadow-primary-600/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Details</>}
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

export default StudentList;
