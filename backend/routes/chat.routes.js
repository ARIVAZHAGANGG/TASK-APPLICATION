const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const auth = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protect all chat routes
router.use(auth);

// Get chat history between two users
router.get('/history/:userId', chatController.getChatHistory);

// Get summary of all conversations
router.get('/conversations', chatController.getRecentConversations);

// Send a direct message
router.post('/send', chatController.sendMessage);

// Assign a mentor to a student (Admin/Mentor only)
router.post('/assign-mentor', roleMiddleware('admin', 'mentor'), chatController.assignMentor);

// Search users to start a new chat
router.get('/users/search', chatController.searchUsers);

module.exports = router;
