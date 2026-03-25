const Task = require('../models/Task');
const mongoose = require('mongoose');

exports.getAnalytics = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 1. Task Counts & Completion Rate
        const taskStats = await Task.aggregate([
            { $match: { createdBy: userId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: ["$completed", 1, 0] } },
                    highPriority: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } }
                }
            }
        ]);

        const stats = taskStats[0] || { total: 0, completed: 0, highPriority: 0 };
        const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

        // 2. Completion Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trend = await Task.aggregate([
            {
                $match: {
                    createdBy: userId,
                    completed: true,
                    updatedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 3. Priority Distribution
        const priorities = await Task.aggregate([
            { $match: { createdBy: userId, completed: false } },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            stats,
            completionRate,
            trend,
            priorities: priorities.map(p => ({
                name: p._id.charAt(0).toUpperCase() + p._id.slice(1),
                value: p.count
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
