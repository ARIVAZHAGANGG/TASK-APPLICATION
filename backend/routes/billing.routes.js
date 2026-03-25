const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const billing = require('../controllers/billing.controller');

// Time Summary
router.get('/time-summary', auth, (req, res) => billing.getTimeSummary(req, res));

// Invoices
router.get('/invoices', auth, (req, res) => billing.getInvoices(req, res));
router.post('/invoices', auth, (req, res) => billing.createInvoice(req, res));
router.get('/invoices/:id', auth, (req, res) => billing.getInvoice(req, res));
router.put('/invoices/:id', auth, (req, res) => billing.updateInvoice(req, res));
router.delete('/invoices/:id', auth, (req, res) => billing.deleteInvoice(req, res));

module.exports = router;
