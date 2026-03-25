const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All support routes are protected
router.use(authMiddleware);

router.post('/chat', (req, res) => supportController.handleSupportChat(req, res));
router.get('/history', (req, res) => supportController.getSupportHistory(req, res));
router.delete('/history', (req, res) => supportController.clearSupportHistory(req, res));


module.exports = router;
