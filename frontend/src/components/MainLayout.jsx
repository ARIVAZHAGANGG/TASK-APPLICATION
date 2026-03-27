import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "../services/api";
import VoiceAssistant from "./ui/VoiceAssistant";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import TaskModal from "./ui/TaskModal";
import MagicSearch from "./ui/MagicSearch";
import TaskAssistant from "./support/TaskAssistant";
import SupportChat from "./support/SupportChat";

const MainLayout = () => {
    const { user, loading } = useAuth();
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [initialBulkMode, setInitialBulkMode] = useState(false);
    const [isMagicSearchOpen, setIsMagicSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsMagicSearchOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleCreateTask = async (formData) => {
        try {
            if (Array.isArray(formData)) {
                await Promise.all(formData.map(data => api.post("/tasks", data)));
                toast.success(`${formData.length} tasks launched!`);
            } else {
                await api.post("/tasks", formData);
                toast.success("New task created");
            }
            setIsTaskModalOpen(false);
            // Dispatch event to refresh tasks in Tasks.jsx
            window.dispatchEvent(new CustomEvent("refresh-tasks"));
        } catch (error) {
            toast.error("Failed to create task");
        }
    };

    return (
        <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden relative">
            
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 z-[70] lg:hidden shadow-2xl"
                        >
                            <Sidebar isMobile onCollapse={() => setIsMobileMenuOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Sidebar (Desktop) */}
            <div className="hidden lg:flex">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <Navbar 
                    onNewTask={() => { setInitialBulkMode(false); setIsTaskModalOpen(true); }} 
                    onNewBulkTask={() => { setInitialBulkMode(true); setIsTaskModalOpen(true); }}
                    onMenuToggle={() => setIsMobileMenuOpen(true)}
                />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar overscroll-contain">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-7xl mx-auto"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>

            {/* Mobile FAB */}
            <button
                onClick={() => { setInitialBulkMode(false); setIsTaskModalOpen(true); }}
                className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-all border-4 border-white dark:border-slate-900"
            >
                <Plus size={24} strokeWidth={3} />
            </button>

            <TaskModal
                isOpen={isTaskModalOpen}
                initialBulkMode={initialBulkMode}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleCreateTask}
            />

            <MagicSearch
                isOpen={isMagicSearchOpen}
                onClose={() => setIsMagicSearchOpen(false)}
                onNewBulkTask={() => { setInitialBulkMode(true); setIsTaskModalOpen(true); }}
            />

            <TaskAssistant />

            {/* VoiceAssistant removed as requested - mic restricted to specific assignment areas for Admin */}
        </div>
    );
};

export default MainLayout;
