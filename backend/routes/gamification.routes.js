const router = require('express').Router();
const gamificationController = require('../controllers/gamification.controller');
const auth = require('../middleware/auth.middleware');

router.get('/stats', auth, (req, res) => gamificationController.getStats(req, res));
router.post('/arcade/reward', auth, (req, res) => gamificationController.rewardGamePoints(req, res));
router.get('/report/download', auth, (req, res) => gamificationController.downloadReport(req, res));

module.exports = router;
