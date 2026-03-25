const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, (req, res) => notificationController.getNotifications(req, res));
router.get('/user/:userId', authMiddleware, (req, res) => notificationController.getNotificationsByUser(req, res));
router.put('/read-all', authMiddleware, (req, res) => notificationController.markAllAsRead(req, res));
router.put('/read-all/:userId', authMiddleware, (req, res) => notificationController.markAllAsReadByUser(req, res));
router.put('/read/:id', authMiddleware, (req, res) => notificationController.markAsReadById(req, res));
router.delete('/clear', authMiddleware, (req, res) => notificationController.clearNotifications(req, res));
router.delete('/:id', authMiddleware, (req, res) => notificationController.deleteNotification(req, res));
router.delete('/user/:userId', authMiddleware, (req, res) => notificationController.clearNotificationsByUser(req, res));
router.put('/read-task/:taskId', authMiddleware, (req, res) => notificationController.markTaskNotificationsAsRead(req, res));

module.exports = router;
