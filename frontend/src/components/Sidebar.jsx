import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Sun,
    Star,
    CheckCircle2,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    BarChart3,
    Columns,
    Calendar as CalendarIcon,
    CircleHelp,
    Users,
    MessageSquare,
    Home,
    ClipboardCheck,
    Map,
    ClipboardList,
    UserCheck,
    BookOpen,
    Code2,
    FlaskConical,
    Monitor,
    MapPin
} from "lucide-react";
import { cn } from "../utils/cn";
import InstallPrompt from "./ui/InstallPrompt";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isMobile, onCollapse }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { logout, user } = useAuth();
    const location = useLocation();

    const getMenuGroups = () => {
        const role = user?.role || 'student';

        switch (role) {
            case 'mentor':
                return [
                    {
                        label: "OVERVIEW",
                        items: [
                            { name: "Dashboard", icon: LayoutDashboard, path: "/" },
                            { name: "My Task", icon: ClipboardCheck, path: "/my-tasks" },
                            { name: "Messages", icon: MessageSquare, path: "/messages" },
                        ]
                    },
                    {
                        label: "MANAGEMENT",
                        items: [
                            { name: "Students", icon: Users, path: "/students" },
                            { name: "Assign Tasks", icon: ClipboardList, path: "/assign-task" },
                            { name: "Assigned Tasks", icon: ClipboardCheck, path: "/assigned-tasks" },
                            { name: "Task List", icon: Columns, path: "/board" },
                        ]
                    },
                    {
                        label: "ANALYTICS",
                        items: [
                            { name: "Calendar", icon: CalendarIcon, path: "/calendar" },
                            { name: "Tasks Overview", icon: Sun, path: "/tasks" },
                            { name: "Productivity", icon: BarChart3, path: "/report" },
                            { name: "Activity Log", icon: LayoutDashboard, path: "/activity-log" },
                        ]
                    },
                ];
            case 'admin':
                return [
                    {
                        label: "OVERVIEW",
                        items: [
                            { name: "Admin Dashboard", icon: LayoutDashboard, path: "/" },
                            { name: "My Task", icon: ClipboardCheck, path: "/my-tasks" },
                            { name: "Messages", icon: MessageSquare, path: "/messages" },
                        ]
                    },
                    {
                        label: "USER CONTROL",
                        items: [
                            { name: "User Management", icon: Users, path: "/users" },
                            { name: "Mentor Registry", icon: UserCheck, path: "/mentors" },
                        ]
                    },
                    {
                        label: "TASKS",
                        items: [
                            { name: "Calendar", icon: CalendarIcon, path: "/calendar" },
                            { name: "Assign Tasks", icon: ClipboardList, path: "/assign-task" },
                            { name: "Assigned Tasks", icon: ClipboardCheck, path: "/assigned-tasks" },
                            { name: "Task Oversight", icon: Columns, path: "/system-tasks" },
                        ]
                    },
                ];
            case 'student':
            default:
                return [
                    {
                        label: null,
                        items: [
                            { name: "Dashboard", icon: LayoutDashboard, path: "/" },
                            { name: "Messages", icon: MessageSquare, path: "/messages" },
                        ]
                    },
                    {
                        label: "MY FOCUS",
                        items: [
                            { name: "My Day", icon: Sun, path: "/my-day" },
                            { name: "Task List", icon: Columns, path: "/board" },
                        ]
                    },
                    {
                        label: "PLANNING",
                        items: [
                            { name: "Important", icon: Star, path: "/important" },
                            { name: "Calendar", icon: CalendarIcon, path: "/calendar" },
                        ]
                    },
                    {
                        label: "PERFORMANCE",
                        items: [
                            { name: "Completed", icon: CheckCircle2, path: "/completed" },
                            { name: "Productivity", icon: BarChart3, path: "/report" },
                        ]
                    },
                ];
        }
    };

    const menuGroups = getMenuGroups();

    return (
        <div
            style={{ 
                width: isMobile ? '280px' : (isCollapsed ? '72px' : '260px') 
            }}
            className={cn(
                "h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out z-50 sticky top-0 overflow-hidden shadow-sm",
                isMobile ? "w-[280px]" : ""
            )}
        >
            {/* Header / Logo */}
            <div className="p-5 flex items-center justify-between h-20 shrink-0 border-b border-slate-50 dark:border-slate-800">
                {(!isCollapsed || isMobile) && (
                    <div className="flex items-center gap-3 transition-opacity duration-200">
                        <div className={cn(
                            "flex items-center justify-center w-9 h-9 rounded-xl shadow-lg",
                            user?.role === 'admin' ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30" :
                            user?.role === 'mentor' ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30" :
                            "bg-gradient-to-br from-blue-600 to-cyan-500 shadow-blue-500/30"
                        )}>
                            <span className="text-sm font-black text-white tracking-tighter">BIT</span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">BIT</span>
                            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Task Management</span>
                        </div>
                    </div>
                )}
                
                {isMobile ? (
                    <button
                        onClick={onCollapse}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                ) : (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn(
                            "p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                            isCollapsed && "mx-auto"
                        )}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                )}
            </div>

            {/* Scrollable Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar space-y-1">
                {menuGroups.map((group, gi) => (
                    <div key={gi} className={gi > 0 ? "mt-5" : ""}>
                        {/* Group Label */}
                        {!isCollapsed && group.label && (
                            <p className="px-3 mb-2 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.18em]">
                                {group.label}
                            </p>
                        )}
                        {isCollapsed && gi > 0 && (
                            <div className="mx-3 my-3 border-t border-white/20" />
                        )}

                        {group.items.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => isMobile && onCollapse && onCollapse()}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-sm font-semibold mb-0.5",
                                    isActive
                                            ? cn(
                                                "shadow-lg scale-[1.02] text-white",
                                                user?.role === 'admin' ? "bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-500/20" :
                                                user?.role === 'mentor' ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-500/20" :
                                                "bg-gradient-to-r from-blue-600 to-blue-400 shadow-blue-500/20"
                                            )
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    {/* Active indicator bar */}
                                    {isActive && (
                                        <span className={cn(
                                            "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full shadow-sm",
                                            user?.role === 'admin' ? "bg-white" :
                                            user?.role === 'mentor' ? "bg-white" :
                                            "bg-white"
                                        )} />
                                    )}
                                    <item.icon
                                        size={17}
                                        className={cn(
                                            "shrink-0 transition-transform group-hover:scale-110",
                                            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                                        )}
                                    />
                                    {!isCollapsed && (
                                        <span className={cn(
                                            "transition-colors",
                                            isActive ? "text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                                        )}>
                                            {item.name}
                                        </span>
                                    )}

                                    {isCollapsed && (
                                        <div className="absolute left-full ml-4 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
                                            {item.name}
                                        </div>
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="shrink-0 px-3 pb-3 border-t border-white/20 pt-3 space-y-0.5">

                {/* Manage Q&A (Admin & Mentor only) */}
                {(user?.role === 'admin' || user?.role === 'mentor') && (
                    <NavLink
                        to="/manage-qa"
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-sm font-semibold w-full",
                            isActive
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <MessageSquare size={17} className={cn("shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                                {!isCollapsed && (
                                    <span className={cn(
                                        "transition-colors",
                                        isActive ? "text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                                    )}>
                                        Manage Q&A
                                    </span>
                                )}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
                                        Manage Q&A
                                    </div>
                                )}
                            </>
                        )}
                    </NavLink>
                )}

                {/* Q & A (Student only) */}
                {user?.role === 'student' && (
                    <NavLink
                        to="/help"
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-sm font-semibold w-full",
                            isActive
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <CircleHelp size={17} className={cn("shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                                {!isCollapsed && (
                                    <span className={cn(
                                        "transition-colors",
                                        isActive ? "text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                                    )}>
                                        Q & A
                                    </span>
                                )}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
                                        Q & A
                                    </div>
                                )}
                            </>
                        )}
                    </NavLink>
                )}

                {/* Settings */}
                <NavLink
                    to="/settings"
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-sm font-semibold w-full",
                        isActive
                            ? "bg-blue-50 text-blue-600 shadow-sm"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                >
                    {({ isActive }) => (
                        <>
                            <Settings size={17} className={cn("shrink-0 transition-transform group-hover:rotate-45", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                            {!isCollapsed && (
                                <span className={cn(
                                    "transition-colors",
                                    isActive ? "text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                                )}>
                                    Settings
                                </span>
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
                                    Settings
                                </div>
                            )}
                        </>
                    )}
                </NavLink>

                {/* ── LOGOUT — always red ── */}
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-sm font-semibold w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                    <LogOut size={17} className="shrink-0 text-red-500 transition-transform group-hover:-translate-x-0.5" />
                    {!isCollapsed && <span>Logout</span>}
                    {isCollapsed && (
                        <div className="absolute left-full ml-4 px-2.5 py-1 bg-red-600 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
                            Logout
                        </div>
                    )}
                </button>
            </div>

            {/* Version Footer */}
            {!isCollapsed && (
                <div className="px-5 py-3 shrink-0 border-t border-slate-200/50">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">BIT v1.0.4</p>
                </div>
            )}

            <InstallPrompt />
        </div>
    );
};

export default Sidebar;
