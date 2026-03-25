const cron = require('node-cron');
const { addDays, addWeeks, addMonths, isBefore } = require('date-fns');
const Task = require('../models/Task');
const RecurrencePattern = require('../models/RecurrencePattern');

/**
 * Cron job to generate recurring tasks
 * Runs daily at midnight (00:00)
 */

function startRecurrenceCron() {
    console.log('🔄 Starting recurring tasks cron job...');

    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('⏰ Running recurring tasks generation...');

        try {
            const now = new Date();

            // Find all active recurrence patterns
            const patterns = await RecurrencePattern.find({
                isActive: true,
                $or: [
                    { endDate: { $exists: false } },
                    { endDate: { $gte: now } }
                ]
            }).populate('taskId');

            for (const pattern of patterns) {
                try {
                    await generateNextOccurrence(pattern, now);
                } catch (error) {
                    console.error(`Error generating task for pattern ${pattern._id}:`, error);
                }
            }

            console.log(`✅ Generated tasks for ${patterns.length} recurring patterns`);
        } catch (error) {
            console.error('❌ Error in recurrence cron job:', error);
        }
    });
}

/**
 * Generate next occurrence of a recurring task
 */
async function generateNextOccurrence(pattern, currentDate) {
    const originalTask = pattern.taskId;

    if (!originalTask) {
        console.warn(`Warning: Original task not found for pattern ${pattern._id}`);
        return;
    }

    // Calculate next due date
    let nextDueDate;
    const lastGenerated = pattern.lastGenerated || originalTask.dueDate || currentDate;

    switch (pattern.frequency) {
        case 'daily':
            nextDueDate = addDays(lastGenerated, pattern.interval);
            break;
        case 'weekly':
            nextDueDate = addWeeks(lastGenerated, pattern.interval);
            break;
        case 'monthly':
            nextDueDate = addMonths(lastGenerated, pattern.interval);
            break;
        default:
            throw new Error(`Invalid frequency: ${pattern.frequency}`);
    }

    // Check if it's time to generate
    if (isBefore(currentDate, nextDueDate)) {
        return; // Not time yet
    }

    // Check if end date has passed
    if (pattern.endDate && isBefore(pattern.endDate, nextDueDate)) {
        pattern.isActive = false;
        await pattern.save();
        console.log(`Recurrence pattern ${pattern._id} has ended`);
        return;
    }

    // Create new task as a copy of original
    const newTask = new Task({
        title: originalTask.title,
        description: originalTask.description,
        dueDate: nextDueDate,
        priority: originalTask.priority,
        status: 'todo',
        completed: false,
        tags: originalTask.tags,
        subtasks: originalTask.subtasks.map(st => ({
            title: st.title,
            completed: false
        })),
        createdBy: originalTask.createdBy,
        estimatedTime: originalTask.estimatedTime,
        recurrenceId: pattern._id
    });

    await newTask.save();

    // Update lastGenerated
    pattern.lastGenerated = nextDueDate;
    await pattern.save();

    console.log(`✅ Generated recurring task: ${newTask.title} (${newTask._id})`);
}

/**
 * Manually create recurrence pattern
 */
async function createRecurrence(taskId, frequency, interval = 1, endDate = null) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new Error('Task not found');
    }

    const pattern = new RecurrencePattern({
        taskId,
        frequency,
        interval,
        endDate,
        createdBy: task.createdBy,
        isActive: true
    });

    await pattern.save();

    // Update task to link to recurrence
    task.recurrenceId = pattern._id;
    await task.save();

    return pattern;
}

/**
 * Stop recurrence for a task
 */
async function stopRecurrence(recurrenceId) {
    const pattern = await RecurrencePattern.findById(recurrenceId);

    if (!pattern) {
        throw new Error('Recurrence pattern not found');
    }

    pattern.isActive = false;
    await pattern.save();

    return pattern;
}

module.exports = {
    startRecurrenceCron,
    createRecurrence,
    stopRecurrence,
    generateNextOccurrence
};
