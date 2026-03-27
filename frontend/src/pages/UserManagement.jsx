import { useState, useEffect } from "react";
import { Users, Search, Filter, Shield, MoreVertical, Loader2, User as UserIcon } from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";

const UserManagement = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await api.get("/admin/staff");
                setStaff(res.data);
            } catch (error) {
                toast.error("Failed to load staff members");
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    const filteredStaff = staff.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.staffId?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-primary-500/30">Registry</h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">Verified staff members and access identification.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold" size={18} />
                        <input
                            type="text"
                            placeholder="Find by name or Staff ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="saas-input pl-12 h-11 sm:h-12 text-sm"
                        />
                    </div>
                    <button className="p-2 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl text-slate-600 shadow-sm">
                        <Filter size={18} className="sm:size-5" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredStaff.length > 0 ? filteredStaff.map((member, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={member.id || member._id}
                        className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-[28px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-primary-500/30 transition-all"
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors border border-slate-100 dark:border-slate-700">
                                    <UserIcon size={24} className="sm:size-7" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs sm:text-sm tracking-tight truncate max-w-[120px] sm:max-w-[150px]">{member.name}</h3>
                                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">{member.email}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest",
                                member.role === 'admin' ? "bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/10 dark:border-red-800" : "bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800"
                            )}>
                                {member.role}
                            </div>
                        </div>
                        
                        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorization</p>
                                <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-widest font-mono bg-slate-50 dark:bg-slate-800 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl w-fit">
                                    {member.staffId}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verified On</p>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400">
                                    {new Date(member.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Shield size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Personnel Matches</h3>
                        <p className="text-slate-500 mt-2 font-medium">Refine your search parameters to find the staff member.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
