import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { playNotificationSound } from '../utils/sound';

/**
 * Hook to handle browser notifications for task reminders.
 * @param {Array} tasks - List of tasks to check
 */
const useReminder = (tasks) => {
    const triggeredReminders = useRef(new Set());

    const hasLoggedPermission = useRef(false);

    // Request permission on mount
    useEffect(() => {
        if ("Notification" in window && !hasLoggedPermission.current) {
            hasLoggedPermission.current = true;
            if (Notification.permission === "default") {
                Notification.requestPermission().then(permission => {
                    console.log("🔔 [Reminder Hook] Permission granted:", permission === "granted");
                });
            } else if (Notification.permission === "denied") {
                console.warn("🔔 [Reminder Hook] Notifications are blocked by user.");
            }
        }
    }, []);

    useEffect(() => {
        if (!tasks || tasks.length === 0) return;

        const checkReminders = () => {
            const now = new Date();
            // Round to minute to ignore seconds for comparison if needed, 
            // but we use >= to catch any missed ones.

            tasks.forEach(async (task) => {
                if (task.reminderEnabled && !task.reminderSent && task.reminderDate) {
                    const reminderTime = new Date(task.reminderDate);
                    const taskId = task.id || task._id;

                    // Avoid double firing for the same task in this session
                    if (triggeredReminders.current.has(taskId)) return;

                    // Timezone-safe comparison: Both are Date objects
                    // now is local, reminderTime is parsed from UTC ISO string (so it's local in Date object)
                    if (now >= reminderTime) {
                        console.log(`⏰ [Reminder Hook] Triggering reminder for: ${task.title}`);
                        triggeredReminders.current.add(taskId);

                        // Local browser notification
                        if ("Notification" in window && Notification.permission === "granted") {
                            try {
                                new window.Notification(`Bit-task: ${task.title}`, {
                                    body: `Objective alert! Priority: ${task.priority.toUpperCase()}`,
                                    icon: "/logo192.png", // Ensure fallback icon
                                    tag: taskId, // Prevent duplicate notes for same task
                                });
                            } catch (err) {
                                console.error("❌ Notification Error:", err);
                            }
                        }

                        // App Toast
                        toast.info(`🔔 Reminder: ${task.title}`, {
                            description: "It's time to focus on your task!",
                            duration: 8000,
                        });

                        // Sound
                        // Assume user preference is in local storage or passed. For now, use 'soft' by default.
                        playNotificationSound('soft');

                        // Backend Synchronization: Mark as sent so it doesn't fire again on other devices or refreshes
                        try {
                            await api.put(`/tasks/${taskId}/reminder-sent`);
                            console.log(`✅ [Reminder Hook] Backend updated for: ${task.title}`);
                        } catch (err) {
                            console.error(`❌ [Reminder Hook] Failed to update backend for ${task.title}:`, err.message);
                            // If it fails, it might fire again on refresh, but triggeredReminders Set protects it for now.
                        }
                    }
                }
            });
        };

        // Check every 30 seconds for higher precision
        const intervalId = setInterval(checkReminders, 30000);
        checkReminders(); // Initial check

        return () => clearInterval(intervalId);
    }, [tasks]);
};

export default useReminder;
