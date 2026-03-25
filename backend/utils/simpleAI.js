/**
 * Simple Rule-Based AI engine for Task BitSathy.
 * No external API dependencies. Efficient and local.
 */

/**
 * Suggests priority based on due date.
 * @param {Date|string} dueDate 
 * @returns {string} Suggested priority ('high', 'medium', 'low')
 */
const suggestPriority = (dueDate) => {
    if (!dueDate) return 'low';

    const now = new Date();
    const due = new Date(dueDate);
    const diffInMs = due - now;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 0) return 'high'; // Already overdue
    if (diffInHours < 24) return 'high';
    if (diffInHours <= 72) return 'medium'; // 1-3 days
    return 'low';
};

/**
 * Checks for overdue risk.
 * @param {number} pendingTasksCount 
 * @param {Date|string} dueDate 
 * @returns {boolean} True if high risk of delay
 */
const checkOverdueRisk = (pendingTasksCount, dueDate) => {
    if (!dueDate) return false;

    const now = new Date();
    const due = new Date(dueDate);
    const diffInMs = due - now;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    // If more than 5 pending tasks and new task due in less than 2 days
    if (pendingTasksCount > 5 && diffInDays < 2) {
        return true;
    }
    return false;
};

/**
 * Calculates productivity score.
 * @param {number} completed 
 * @param {number} total 
 * @returns {number} Score from 0 to 100
 */
const calculateProductivityScore = (completed, total) => {
    if (!total || total === 0) return 0;
    return Math.round((completed / total) * 100);
};

/**
 * Generates dynamic AI insight messages based on task statistics.
 * @param {Object} stats 
 * @returns {Array} Array of insight objects { type: 'trend' | 'warning', message: string }
 */
const generateAIInsight = (stats) => {
    const { total, completed, pending, highPriorityPending } = stats;
    const insights = [];

    const score = calculateProductivityScore(completed, total);

    // Productivity Score Insights
    if (total > 0) {
        if (score === 100) {
            insights.push({ type: 'trend', message: "Perfect score! You've crushed all your tasks. Time for a break? 🌟" });
        } else if (score > 70) {
            insights.push({ type: 'trend', message: `High productivity (${score}%)! You're in the flow. Keep up the momentum. 🔥` });
        } else if (score < 40 && total > 3) {
            insights.push({ type: 'trend', message: "Productivity is a bit low. Focus on completing just one small task to get started. 💪" });
        }
    }

    // Workload & Priority Warnings
    if (highPriorityPending > 0) {
        insights.push({ type: 'warning', message: `Attention: ${highPriorityPending} high-priority tasks are still pending. Prioritize these! 🚀` });
    }

    if (pending > 5) {
        insights.push({ type: 'warning', message: `You have ${pending} pending tasks. Breaking them into smaller steps might help reduce the load. 📝` });
    }

    // Default if no insights
    if (insights.length === 0) {
        insights.push({ type: 'trend', message: "Stay focused and keep making progress. Every step counts! ✨" });
    }

    return insights;
};

module.exports = {
    suggestPriority,
    checkOverdueRisk,
    calculateProductivityScore,
    generateAIInsight
};
