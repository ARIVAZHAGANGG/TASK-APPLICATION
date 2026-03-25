const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    description: { type: String, required: true },
    minutes: { type: Number, required: true, min: 0 },
    hourlyRate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 }
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    invoiceNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid'],
        default: 'draft'
    },
    clientInfo: {
        name: { type: String, required: true },
        email: String,
        address: String,
        company: String
    },
    freelancerInfo: {
        name: { type: String, required: true },
        email: String,
        address: String,
        company: String
    },
    lineItems: [lineItemSchema],
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },   // Percentage, e.g. 10 for 10%
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    issuedAt: { type: Date, default: Date.now },
    dueDate: Date,
    notes: String
}, { timestamps: true });

invoiceSchema.index({ userId: 1, createdAt: -1 });

invoiceSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
