const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
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
        type: Number, // Duration in seconds
        default: 0
    },
    type: {
        type: String,
        enum: ['manual', 'pomodoro'],
        default: 'manual'
    },
    notes: String
}, {
    timestamps: true
});

// Compound index for user's time logs
timeLogSchema.index({ userId: 1, startTime: -1 });
timeLogSchema.index({ taskId: 1, startTime: -1 });

// Virtual for duration in minutes
timeLogSchema.virtual('durationMinutes').get(function () {
    return Math.round(this.duration / 60);
});

// Method to calculate duration
timeLogSchema.methods.calculateDuration = function () {
    if (this.endTime && this.startTime) {
        this.duration = Math.round((this.endTime - this.startTime) / 1000);
    }
    return this.duration;
};

timeLogSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('TimeLog', timeLogSchema);
