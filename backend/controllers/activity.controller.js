const ActivityLog = require('../models/ActivityLog');

/**
 * Get all activities for the logged-in user
 * GET /api/activity-log
 */
exports.getActivities = async (req, res) => {
    try {
        const activities = await ActivityLog.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Clear all activity history for the logged-in user
 * DELETE /api/activity-log
 */
exports.clearActivities = async (req, res) => {
    try {
        await ActivityLog.deleteMany({ userId: req.user.id });
        res.json({ message: "Activity history cleared successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all activities for a specific user
 * GET /api/activity/user/:userId
 */
exports.getActivitiesByUser = async (req, res) => {
    try {
        // Security
        if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        const activities = await ActivityLog.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get user history (Timeline style)
 * GET /api/history/user/:userId
 */
exports.getUserHistory = async (req, res) => {
    try {
        // Security
        if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        // For "History", we might want to group by date or just return sorted activities
        // The request mentions "Filter by date" and "Show timeline style"
        // We'll return the raw logs for now, and let frontend handle grouping
        // But we'll include more logs (last 200)
        const history = await ActivityLog.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(200);
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Utility function to log an activity (Internal use)
 */
exports.logActivity = async (userId, action, targetType, targetId, metadata = {}) => {
    try {
        await ActivityLog.create({
            userId,
            action,
            targetType,
            targetId,
            metadata
        });
    } catch (error) {
        console.error("Activity logging failed:", error);
    }
};
