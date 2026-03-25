const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isEdited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
commentSchema.index({ taskId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });

// Parse @mentions before saving
commentSchema.pre('save', function (next) {
    if (this.isModified('content')) {
        // Extract user IDs from @mentions (assuming format @userId)
        const mentionRegex = /@([a-f\d]{24})/gi;
        const matches = [...this.content.matchAll(mentionRegex)];
        this.mentions = matches.map(m => m[1]).filter((v, i, a) => a.indexOf(v) === i);
    }
    next();
});

commentSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('Comment', commentSchema);
