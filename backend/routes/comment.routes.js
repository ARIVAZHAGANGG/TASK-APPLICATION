const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/comment.controller');

// Get comments for a task
router.get('/:taskId', auth, (req, res) => controller.getTaskComments(req, res));

// Add comment to a task
router.post('/:taskId', auth, (req, res) => controller.addComment(req, res));

// Update comment
router.put('/:commentId', auth, (req, res) => controller.updateComment(req, res));

// Delete comment
router.delete('/:commentId', auth, (req, res) => controller.deleteComment(req, res));

module.exports = router;
