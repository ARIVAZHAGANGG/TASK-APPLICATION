const Notification = require('../models/Notification');

/**
 * Get all notifications for the logged-in user
 * GET /api/notifications
 */
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get notifications for a specific user
 * GET /api/notifications/user/:userId
 */
exports.getNotificationsByUser = async (req, res) => {
    try {
        // Security
        if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        const notifications = await Notification.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Mark all notifications as read for the logged-in user
 * PUT /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Mark a single notification as read by ID (URL param)
 * PUT /api/notifications/read/:id
 */
exports.markAsReadById = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Mark all notifications as read for a specific user
 * PUT /api/notifications/read-all/:userId
 */
exports.markAllAsReadByUser = async (req, res) => {
    try {
        // Security: Ensure the user is only updating their own notifications
        if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Notification.updateMany(
            { userId: req.params.userId, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete a single notification
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Clear all notifications for the logged-in user
 * DELETE /api/notifications/clear
 */
exports.clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user.id });
        res.json({ message: "Notification history cleared successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Clear all notifications for a specific user
 * DELETE /api/notifications/user/:userId
 */
exports.clearNotificationsByUser = async (req, res) => {
    try {
        // Security
        if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Notification.deleteMany({ userId: req.params.userId });
        res.json({ message: "Notification history cleared successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Mark notifications for a specific task as read
 * PUT /api/notifications/read-task/:taskId
 */
exports.markTaskNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { 
                userId: req.user.id, 
                taskId: req.params.taskId,
                isRead: false 
            },
            { $set: { isRead: true } }
        );
        res.json({ message: "Task notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Utility function to create a notification (Internal use)
 */
exports.createNotification = async (userId, type, title, message, link, metadata = {}) => {
    try {
        const notificationData = {
            userId,
            type,
            title,
            message,
            link,
            metadata
        };

        // If taskId is in metadata, set it at the top level for easier frontend access
        if (metadata.taskId) {
            notificationData.taskId = metadata.taskId;
        }

        await Notification.create(notificationData);
    } catch (error) {
        console.error("Notification creation failed:", error);
    }
};
