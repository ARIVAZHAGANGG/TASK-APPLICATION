const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, (req, res) => activityController.getActivities(req, res));
router.get('/user/:userId', authMiddleware, (req, res) => activityController.getUserHistory(req, res));
router.get('/history/user/:userId', authMiddleware, (req, res) => activityController.getUserHistory(req, res));
router.get('/log/user/:userId', authMiddleware, (req, res) => activityController.getActivitiesByUser(req, res));
router.delete('/', authMiddleware, (req, res) => activityController.clearActivities(req, res));

module.exports = router;
