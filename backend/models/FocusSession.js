const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // Duration in seconds (usually 1500 for 25 min Pomodoro)
        default: 1500
    },
    completed: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['focus', 'short_break', 'long_break'],
        default: 'focus'
    }
}, {
    timestamps: true
});

// Index for user's focus sessions
focusSessionSchema.index({ userId: 1, startTime: -1 });
focusSessionSchema.index({ userId: 1, completed: 1 });

// Virtual for streak calculation
focusSessionSchema.statics.getUserStreak = async function (userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await this.find({
        userId,
        completed: true,
        type: 'focus',
        startTime: { $gte: today }
    });

    return sessions.length;
};

focusSessionSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('FocusSession', focusSessionSchema);
