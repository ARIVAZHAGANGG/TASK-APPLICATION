/**
 * Generates an array of dates for the last n days
 */
exports.getLastDays = (n) => {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};

/**
 * Common aggregation fragments
 */
exports.matchUser = (userId) => ({
    $match: { createdBy: userId }
});
