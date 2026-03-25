const mongoose = require('mongoose');

const SupportMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'ai'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    context: {
        page: String,
        title: String
    }
});

module.exports = mongoose.model('SupportMessage', SupportMessageSchema);
