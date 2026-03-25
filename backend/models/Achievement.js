const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: '🏆'
    },
    criteria: {
        type: {
            type: String,
            enum: ['tasks_completed', 'streak_days', 'pomodoro_sessions', 'time_logged'],
            required: true
        },
        count: {
            type: Number,
            required: true
        }
    },
    rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    points: {
        type: Number,
        default: 100
    }
}, {
    timestamps: true
});

achievementSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('Achievement', achievementSchema);
