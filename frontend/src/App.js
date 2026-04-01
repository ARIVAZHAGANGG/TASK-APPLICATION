import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "sonner";
import { SearchProvider } from "./context/SearchContext";
import { SocketProvider } from "./context/SocketContext";

// Eager load critical pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Tasks from "./pages/Tasks";
import Dashboard from "./pages/Dashboard";
import MyTasks from "./pages/MyTasks";
import ActivityLog from "./pages/ActivityLog";
import NotificationsPage from "./pages/NotificationsPage";
import Settings from "./pages/Settings";
import ProductivityReport from "./pages/ProductivityReport";
import Kanban from "./pages/Kanban";
import CalendarView from "./pages/CalendarView";
import MainLayout from "./components/MainLayout";

import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import TaskManagement from "./pages/TaskManagement";
import AssignTask from "./pages/AssignTask";
import StudentList from "./pages/StudentList";
import MentorList from "./pages/MentorList";
import QAManagement from "./pages/QAManagement";
import MentorProfile from "./pages/MentorProfile";
import AssignedTasks from "./pages/AssignedTasks";
import Messages from "./pages/Messages";

// Lazy load heavy components for better initial load time
const Analytics = lazy(() => import("./pages/Analytics"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));

// Loading fallback component
const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white text-xs font-bold text-center py-2 z-[9999] animate-pulse">
      You are currently offline. Bit-task is running in offline mode.
    </div>
  );
};

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

const AuthNavigator = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const StudentNavigator = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/my-day" element={<Tasks filter="myday" />} />
      <Route path="/important" element={<Tasks filter="important" />} />
      <Route path="/planned" element={<Tasks filter="planned" />} />
      <Route path="/completed" element={<Tasks filter="completed" />} />
      <Route path="/my-tasks" element={<MyTasks />} />
      <Route path="/activity-log" element={<ActivityLog />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/board" element={<Kanban />} />
      <Route path="/calendar" element={<CalendarView />} />

      <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
      <Route path="/help" element={<Suspense fallback={<PageLoader />}><HelpCenter /></Suspense>} />
      <Route path="/messages" element={<Messages />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

const MentorNavigator = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/assign-task" element={<AssignTask />} />
      <Route path="/students" element={<StudentList />} />
      <Route path="/calendar" element={<CalendarView />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/my-tasks" element={<Tasks filter="assigned_to_me" />} />
      <Route path="/board" element={<Kanban />} />
      <Route path="/report" element={<ProductivityReport />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Suspense fallback={<PageLoader />}><HelpCenter /></Suspense>} />
      <Route path="/manage-qa" element={<QAManagement />} />
      <Route path="/assigned-tasks" element={<AssignedTasks />} />
      <Route path="/activity-log" element={<ActivityLog />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

const AdminNavigator = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/assign-task" element={<AssignTask />} />
      <Route path="/mentors" element={<MentorList />} />
      <Route path="/mentors/:id" element={<MentorProfile />} />
      <Route path="/calendar" element={<CalendarView />} />
      <Route path="/system-tasks" element={<TaskManagement />} />
      <Route path="/my-tasks" element={<Tasks filter="assigned_to_me" />} />
      <Route path="/assigned-tasks" element={<AssignedTasks />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/report" element={<ProductivityReport />} />
      <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
      <Route path="/help" element={<Suspense fallback={<PageLoader />}><HelpCenter /></Suspense>} />
      <Route path="/manage-qa" element={<QAManagement />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

const RoleBasedRouter = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <PageLoader />;
  if (!user) return <AuthNavigator />;
  
  switch (user.role) {
      case 'mentor': return <MentorNavigator />;
      case 'admin': return <AdminNavigator />;
      case 'student':
      default: return <StudentNavigator />;
  }
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <SearchProvider>
            <Toaster position="top-right" richColors closeButton />
            <OfflineBanner />

            <Router>
              <RoleBasedRouter />
            </Router>
          </SearchProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
