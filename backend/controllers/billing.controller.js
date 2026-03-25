const mongoose = require('mongoose');
const TimeLog = require('../models/TimeLog');
const Invoice = require('../models/Invoice');

/* ── Helper ─────────────────────────────────────────── */
const generateInvoiceNumber = async (userId) => {
    const year = new Date().getFullYear();
    const count = await Invoice.countDocuments({ userId }) + 1;
    return `INV-${year}-${String(count).padStart(3, '0')}`;
};

/* ── GET /billing/time-summary ──────────────────────── */
// Returns total minutes spent per task for a date range (default: all time)
exports.getTimeSummary = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User ID missing in token' });
        }

        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { startDate, endDate } = req.query;

        const matchQuery = { userId };
        if (startDate || endDate) {
            matchQuery.startTime = {};
            if (startDate) matchQuery.startTime.$gte = new Date(startDate);
            if (endDate) matchQuery.startTime.$lte = new Date(endDate);
        }

        // Only count completed sessions
        matchQuery.endTime = { $exists: true, $ne: null };

        const summary = await TimeLog.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$taskId',
                    totalSeconds: { $sum: '$duration' },
                    sessionCount: { $sum: 1 },
                    lastTracked: { $max: '$startTime' }
                }
            },
            {
                $lookup: {
                    from: 'tasks',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'task'
                }
            },
            { $unwind: { path: '$task', preserveNullAndEmptyArrays: false } },
            {
                $project: {
                    taskId: '$_id',
                    taskTitle: '$task.title',
                    category: '$task.category',
                    totalMinutes: { $round: [{ $divide: ['$totalSeconds', 60] }, 0] },
                    sessionCount: 1,
                    lastTracked: 1
                }
            },
            { $sort: { totalMinutes: -1 } }
        ]);

        // Overall totals
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [todayResult, weekResult, monthResult] = await Promise.all([
            TimeLog.aggregate([
                { $match: { userId, endTime: { $exists: true, $ne: null }, startTime: { $gte: startOfDay } } },
                { $group: { _id: null, total: { $sum: '$duration' } } }
            ]),
            TimeLog.aggregate([
                { $match: { userId, endTime: { $exists: true, $ne: null }, startTime: { $gte: startOfWeek } } },
                { $group: { _id: null, total: { $sum: '$duration' } } }
            ]),
            TimeLog.aggregate([
                { $match: { userId, endTime: { $exists: true, $ne: null }, startTime: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$duration' } } }
            ])
        ]);

        res.json({
            summary,
            totals: {
                today: Math.round((todayResult[0]?.total || 0) / 60),
                week: Math.round((weekResult[0]?.total || 0) / 60),
                month: Math.round((monthResult[0]?.total || 0) / 60)
            }
        });

    } catch (error) {
        console.error('Time summary error:', error);
        res.status(500).json({ message: error.message });
    }
};

/* ── GET /billing/invoices ──────────────────────────── */
exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ── POST /billing/invoices ─────────────────────────── */
exports.createInvoice = async (req, res) => {
    try {
        const { clientInfo, freelancerInfo, lineItems, taxRate, currency, dueDate, notes } = req.body;

        if (!clientInfo?.name || !freelancerInfo?.name) {
            return res.status(400).json({ message: 'Client and freelancer name are required' });
        }

        if (!lineItems || lineItems.length === 0) {
            return res.status(400).json({ message: 'At least one line item is required' });
        }

        const invoiceNumber = await generateInvoiceNumber(req.user.id);

        // Calculate amounts
        const processedItems = lineItems.map(item => {
            const hours = item.minutes / 60;
            const amount = parseFloat((hours * item.hourlyRate).toFixed(2));
            return { ...item, amount };
        });

        const subtotal = parseFloat(processedItems.reduce((s, i) => s + i.amount, 0).toFixed(2));
        const taxRateVal = parseFloat(taxRate) || 0;
        const taxAmount = parseFloat((subtotal * taxRateVal / 100).toFixed(2));
        const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

        const invoice = await Invoice.create({
            userId: req.user.id,
            invoiceNumber,
            clientInfo,
            freelancerInfo,
            lineItems: processedItems,
            subtotal,
            taxRate: taxRateVal,
            taxAmount,
            totalAmount,
            currency: currency || 'USD',
            dueDate,
            notes
        });

        res.status(201).json(invoice);
    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(400).json({ message: error.message });
    }
};

/* ── GET /billing/invoices/:id ──────────────────────── */
exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ── PUT /billing/invoices/:id ──────────────────────── */
exports.updateInvoice = async (req, res) => {
    try {
        const { status, clientInfo, freelancerInfo, lineItems, taxRate, currency, dueDate, notes } = req.body;

        const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        if (status) invoice.status = status;
        if (clientInfo) invoice.clientInfo = clientInfo;
        if (freelancerInfo) invoice.freelancerInfo = freelancerInfo;
        if (currency) invoice.currency = currency;
        if (dueDate) invoice.dueDate = dueDate;
        if (notes !== undefined) invoice.notes = notes;

        if (lineItems && lineItems.length > 0) {
            const processedItems = lineItems.map(item => {
                const hours = item.minutes / 60;
                const amount = parseFloat((hours * item.hourlyRate).toFixed(2));
                return { ...item, amount };
            });

            invoice.lineItems = processedItems;
            invoice.subtotal = parseFloat(processedItems.reduce((s, i) => s + i.amount, 0).toFixed(2));
        }

        const taxRateVal = taxRate !== undefined ? parseFloat(taxRate) : invoice.taxRate;
        invoice.taxRate = taxRateVal;
        invoice.taxAmount = parseFloat((invoice.subtotal * taxRateVal / 100).toFixed(2));
        invoice.totalAmount = parseFloat((invoice.subtotal + invoice.taxAmount).toFixed(2));

        await invoice.save();
        res.json(invoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/* ── DELETE /billing/invoices/:id ───────────────────── */
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
