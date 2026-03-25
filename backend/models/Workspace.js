const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        allowMemberInvites: {
            type: Boolean,
            default: false
        },
        taskPrivacy: {
            type: String,
            enum: ['public', 'members_only'],
            default: 'members_only'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
workspaceSchema.index({ 'members.userId': 1 });

// Methods
workspaceSchema.methods.isMember = function (userId) {
    return this.members.some(m => m.userId.toString() === userId.toString()) ||
        this.ownerId.toString() === userId.toString();
};

workspaceSchema.methods.getMemberRole = function (userId) {
    if (this.ownerId.toString() === userId.toString()) {
        return 'admin';
    }
    const member = this.members.find(m => m.userId.toString() === userId.toString());
    return member ? member.role : null;
};

workspaceSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('Workspace', workspaceSchema);
