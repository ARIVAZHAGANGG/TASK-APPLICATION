const mongoose = require('mongoose');

const recurrencePatternSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
        index: true
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true
    },
    interval: {
        type: Number,
        default: 1,
        min: 1
    },
    endDate: {
        type: Date
    },
    lastGenerated: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient cron queries
recurrencePatternSchema.index({ isActive: 1, lastGenerated: 1 });
recurrencePatternSchema.index({ createdBy: 1 });

module.exports = mongoose.model('RecurrencePattern', recurrencePatternSchema);
