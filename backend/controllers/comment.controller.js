const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/user.model');
const notificationController = require('./notification.controller');

// Get comments for a task
exports.getTaskComments = async (req, res) => {
    try {
        const comments = await Comment.find({ taskId: req.params.taskId })
            .populate('userId', 'name email avatar')
            .populate('mentions', 'name email')
            .sort({ createdAt: 1 }); // Sort by creation time ascending for chat flow

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add comment
exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;

        // Verify task exists
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const comment = await Comment.create({
            taskId: req.params.taskId,
            userId: req.user.id,
            content
        });

        // Populate user info for the response and subsequent notifications
        await comment.populate('userId', 'name email avatar');
        const userName = comment.userId?.name || 'A user';

        // --- Notification Logic ---
        const targets = new Set();
        
        // Notify creator if not self
        if (task.createdBy && task.createdBy.toString() !== req.user.id) {
            targets.add(task.createdBy.toString());
        }

        // Notify assignee if not self
        const assigneeId = task.assignedToUserId || task.assignedTo;
        if (assigneeId && assigneeId.toString() !== req.user.id) {
            targets.add(assigneeId.toString());
        }

        // Notify assigner (mentor) if not self
        if (task.assignedByUserId && task.assignedByUserId.toString() !== req.user.id) {
            targets.add(task.assignedByUserId.toString());
        }

        // --- NEW: Notify student's personal mentor ---
        if (assigneeId) {
            const student = await User.findById(assigneeId);
            if (student && student.mentorId && student.mentorId.toString() !== req.user.id) {
                targets.add(student.mentorId.toString());
            }
        }

        // Special logic: If a student is commenting, notify all admins
        if (req.user.role === 'student') {
            const admins = await User.find({ role: 'admin' }, '_id');
            admins.forEach(admin => {
                if (admin._id.toString() !== req.user.id) {
                    targets.add(admin._id.toString());
                }
            });
        }

        // Handle Mentions specialized notification
        if (comment.mentions && comment.mentions.length > 0) {
            const mentionNotifications = comment.mentions.map(userId => {
                // If a mention target is also in general targets, remove from general to avoid double notification
                targets.delete(userId.toString());
                
                return {
                    userId,
                    type: 'comment_mention',
                    title: 'You were mentioned in a comment',
                    message: `${userName} mentioned you in a comment on "${task.title}"`,
                    link: `/board?highlight=${task._id}&tab=chat`,
                    taskId: task._id,
                    metadata: { commentId: comment._id }
                };
            });
            await Notification.insertMany(mentionNotifications);
        }

        // Send notifications for other targets
        const notificationPromises = Array.from(targets).map(targetId => {
            return notificationController.createNotification(
                targetId,
                'task_comment',
                `New message on task: ${task.title}`,
                `${userName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                `/board?highlight=${task._id}&tab=chat`,
                { taskId: task._id, commentId: comment._id }
            );
        });

        await Promise.all(notificationPromises);

        // Notify via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.to(req.params.taskId).emit('new_message', comment);
        }

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update comment
exports.updateComment = async (req, res) => {
    try {
        const { content } = req.body;

        const comment = await Comment.findOne({
            _id: req.params.commentId,
            userId: req.user.id
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found or unauthorized' });
        }

        comment.content = content;
        comment.isEdited = true;
        await comment.save();

        await comment.populate('userId', 'name email avatar');

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findOneAndDelete({
            _id: req.params.commentId,
            userId: req.user.id
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found or unauthorized' });
        }

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = exports;
