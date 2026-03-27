import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { User, Settings as SettingsIcon, Shield, Bell, Moon, Sun, Smartphone, Volume2, LogOut, Save, Clock, Check, Trash2, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../utils/cn";
import api from "../services/api";

const Settings = () => {
    const { user, logout, updateUser } = useAuth();
    const { theme, setThemeMode } = useTheme();
    const [activeTab, setActiveTab] = useState("profile");
    const [isLoading, setIsLoading] = useState(false);
    const [activities, setActivities] = useState([]);
    const [history, setHistory] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "activity", label: "Activity Log", icon: Smartphone },
        { id: "history", label: "History", icon: Clock },
        { id: "security", label: "Security", icon: Shield },
        { id: "preferences", label: "Preferences", icon: SettingsIcon },
    ];
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Preferences State
    const [preferences, setPreferences] = useState({
        pushNotifications: true,
        soundEnabled: true,
    });

    // Sync state with user data when it loads
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
            });
            setPreferences({
                pushNotifications: user.preferences?.pushNotifications ?? true,
                soundEnabled: user.preferences?.soundEnabled ?? true,
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.put("/auth/updatedetails", { name: formData.name, email: formData.email });
            updateUser({ name: formData.name });
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("Passwords do not match");
        }
        setIsLoading(true);
        try {
            await api.put("/auth/updatepassword", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success("Password updated successfully");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreferenceUpdate = async (key) => {
        const newPreferences = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPreferences);

        try {
            await api.put("/auth/updatedetails", { preferences: newPreferences });
            updateUser({ preferences: newPreferences });
            toast.success("Preferences updated");
        } catch (error) {
            setPreferences(preferences); // Revert on error
            toast.error("Failed to update preferences");
        }
    };

    useEffect(() => {
        if (activeTab === "activity" && user) {
            fetchActivities();
        } else if (activeTab === "history" && user) {
            fetchHistory();
        }
    }, [activeTab, user]);

    const fetchActivities = async () => {
        try {
            setLogsLoading(true);
            const res = await api.get(`/activity/user/${user._id || user.id}`);
            if (res.data.success) {
                setActivities(res.data.data);
            } else {
                setActivities(Array.isArray(res.data) ? res.data : []);
            }
        } catch (error) {
            toast.error("Failed to fetch activity logs");
        } finally {
            setLogsLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            setLogsLoading(true);
            const res = await api.get(`/history/user/${user._id || user.id}`);
            if (res.data.success) {
                setHistory(res.data.data);
            } else {
                // Handle cases where response might be direct array (fallback)
                setHistory(Array.isArray(res.data) ? res.data : []);
            }
        } catch (error) {
            toast.error("Failed to fetch history timeline");
        } finally {
            setLogsLoading(false);
        }
    };



    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-10 pb-24 md:pb-10 pt-4 md:pt-0">
            <header className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic underline decoration-primary-500/30">Settings</h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 sm:mt-2">Manage your account settings and preferences.</p>
            </header>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar md:sticky md:top-28">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-bold text-[11px] sm:text-sm uppercase tracking-tight whitespace-nowrap ${activeTab === tab.id
                                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                                    : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                    }`}
                            >
                                <tab.icon size={14} className="sm:size-[18px]" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "profile" && (
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-[2rem] sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-center sm:items-start relative z-10 text-center sm:text-left">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-800/50 shadow-inner">
                                                <User size={40} className="sm:size-12" strokeWidth={1.5} />
                                            </div>

                                            <div className="flex-1 space-y-1 sm:space-y-2">
                                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Identity Profile</h2>
                                                <p className="text-xs sm:text-sm text-slate-500 font-medium">Manage your public information and communication settings.</p>
                                                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 sm:mt-4">
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100">Live</span>
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase tracking-widest border border-blue-100">Standard</span>
                                                </div>
                                            </div>
                                        </div>

                                        <form onSubmit={handleProfileUpdate} className="mt-12 space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="saas-input"
                                                        placeholder="Your full name"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="saas-input"
                                                        placeholder="your@email.com"
                                                        required
                                                    />
                                                </div>
                                                {(user.role === 'mentor' || user.role === 'admin') && (
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Staff ID</label>
                                                        <input
                                                            type="text"
                                                            value={user.staffId || "N/A"}
                                                            readOnly
                                                            className="saas-input bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed border-dashed opacity-70"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="btn-primary"
                                                >
                                                    {isLoading ? "Synchronizing Identity..." : "Commit Changes"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeTab === "activity" && (
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                                            <button onClick={fetchActivities} className="text-xs font-bold text-blue-600 uppercase hover:underline">Refresh</button>
                                        </div>

                                        {logsLoading ? (
                                            <div className="space-y-4">
                                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-xl"></div>)}
                                            </div>
                                        ) : activities.length > 0 ? (
                                            <div className="space-y-4">
                                                {activities.map((log) => (
                                                    <div key={log._id} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                                                            <Smartphone size={18} className="text-slate-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                                <span className="text-blue-600 dark:text-blue-400 font-black uppercase text-[10px] mr-2 tracking-wider">{log.action || 'ACTION'}</span>
                                                                {log.message || `${log.action} ${log.targetType}`}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Clock size={12} className="text-slate-400" />
                                                                <span className="text-xs text-slate-400 font-medium">{new Date(log.createdAt).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center">
                                                <p className="text-slate-500 font-medium text-sm">No activity logs found yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "history" && (
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-blue-500/5">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Master Timeline</h2>
                                                <p className="text-sm text-slate-500 font-medium">Full history of your productivity journey</p>
                                            </div>
                                        </div>

                                        {logsLoading ? (
                                            <div className="flex justify-center p-12">
                                                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                            </div>
                                        ) : history.length > 0 ? (
                                            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                                                {history.map((item, idx) => (
                                                    <div key={item._id} className="relative group">
                                                        <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-blue-500 z-10 group-hover:scale-125 transition-transform"></div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">
                                                                {new Date(item.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900/30 transition-all hover:shadow-lg hover:shadow-blue-500/5 group-hover:-translate-y-0.5">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "p-2 rounded-xl text-white",
                                                                    item.action?.includes('delete') ? "bg-red-500" :
                                                                        item.action?.includes('complete') ? "bg-green-500" :
                                                                            "bg-blue-500"
                                                                )}>
                                                                    {item.action?.includes('complete') ? <Check size={14} strokeWidth={4} /> :
                                                                        item.action?.includes('delete') ? <Trash2 size={14} /> : <ListTodo size={14} />}
                                                                </div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.message}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center">
                                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Clock size={24} className="text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 font-medium">The timeline is empty. Start your first mission!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "security" && (
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <h2 className="text-[10px] sm:text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full w-fit uppercase tracking-widest mb-6">Security Authorization</h2>
                                        <form onSubmit={handlePasswordUpdate} className="space-y-4 sm:space-y-5">
                                            <div className="grid gap-2">
                                                <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Current Key</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.currentPassword}
                                                    placeholder="Enter current password"
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="saas-input h-11 sm:h-12 text-sm"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest ml-1">New Key</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.newPassword}
                                                    placeholder="Min 8 characters"
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="saas-input h-11 sm:h-12 text-sm"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Verify Key</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    placeholder="Repeat new password"
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="saas-input h-11 sm:h-12 text-sm"
                                                />
                                            </div>
                                            <div className="pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all w-full sm:w-auto"
                                                >
                                                    {isLoading ? "Synchronizing..." : "Update Security Keys"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    <div className="bg-red-500/5 dark:bg-red-500/5 p-6 sm:p-8 rounded-[2rem] sm:rounded-3xl border border-red-100 dark:border-red-900/30">
                                        <h3 className="text-base sm:text-lg font-black text-red-600 dark:text-red-400 mb-2 uppercase tracking-tight italic">Emergency Sign Out</h3>
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                                            Immediately terminate your current session. You will need to re-authenticate to gain access.
                                        </p>
                                        <button
                                            onClick={logout}
                                            className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-500/20 w-full sm:w-auto"
                                        >
                                            Terminate Session
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "preferences" && (
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Interface Customization</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            {[
                                                { id: "light", icon: Sun, label: "Daylight" },
                                                { id: "dark", icon: Moon, label: "Midnight" },
                                                { id: "amoled", icon: Smartphone, label: "Obsidian" },
                                            ].map(({ id, icon: Icon, label }) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setThemeMode(id)}
                                                    className={cn(
                                                        "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 group",
                                                        theme === id
                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                            : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/30"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                                        theme === id ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-blue-500"
                                                    )}>
                                                        <Icon size={24} />
                                                    </div>
                                                    <span className="font-black text-xs uppercase tracking-widest">{label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                                                    <Bell size={20} strokeWidth={3} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">Push Comms</h3>
                                                    <p className="text-xs text-slate-500 font-medium">Real-time alerts</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handlePreferenceUpdate("pushNotifications")}
                                                className={cn(
                                                    "w-12 h-6 rounded-full relative transition-all duration-500 px-1",
                                                    preferences.pushNotifications ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 bg-white rounded-full transition-all duration-300",
                                                    preferences.pushNotifications ? "translate-x-6" : "translate-x-0"
                                                )}></div>
                                            </button>
                                        </div>

                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600">
                                                    <Volume2 size={20} strokeWidth={3} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">Audio Feedback</h3>
                                                    <p className="text-xs text-slate-500 font-medium">Mission completion sounds</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handlePreferenceUpdate("soundEnabled")}
                                                className={cn(
                                                    "w-12 h-6 rounded-full relative transition-all duration-500 px-1",
                                                    preferences.soundEnabled ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 bg-white rounded-full transition-all duration-300",
                                                    preferences.soundEnabled ? "translate-x-6" : "translate-x-0"
                                                )}></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Settings;
