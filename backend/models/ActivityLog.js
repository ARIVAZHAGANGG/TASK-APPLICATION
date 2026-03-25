const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    },
    action: {
        type: String,
        required: true,
        enum: [
            'task_created',
            'task_updated',
            'task_completed',
            'task_deleted',
            'subtask_added',
            'subtask_completed',
            'comment_added',
            'file_attached',
            'task_assigned',
            'dependency_added',
            'recurrence_created',
            'profile_updated',
            'login'
        ]
    },
    targetType: {
        type: String,
        enum: ['Task', 'Comment', 'Workspace', 'User']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
activityLogSchema.index({ workspaceId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });

activityLogSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
