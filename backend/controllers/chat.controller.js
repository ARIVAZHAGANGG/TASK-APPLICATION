const ChatMessage = require('../models/ChatMessage');
const User = require('../models/user.model');

/**
 * Send a direct message
 */
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content, type } = req.body;
        const senderId = req.user.id;
        const senderRole = req.user.role;

        if (!receiverId || !content) {
            return res.status(400).json({ success: false, message: "Receiver ID and content are required" });
        }

        const newMessage = new ChatMessage({
            senderId,
            receiverId,
            content,
            role: senderRole,
            type: type || 'direct'
        });

        await newMessage.save();

        // Emit socket event if io is available
        const io = req.app.get('io');
        if (io) {
            // Emit to both sender and receiver
            io.to(senderId).emit('private_message', newMessage);
            io.to(receiverId).emit('private_message', newMessage);
        }

        res.status(201).json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};

/**
 * Get chat history between current user and another user
 */
exports.getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const history = await ChatMessage.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        })
        .sort({ createdAt: 1 })
        .limit(100);

        // Mark messages as read
        await ChatMessage.updateMany(
            { senderId: userId, receiverId: currentUserId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({
            success: true,
            history
        });
    } catch (error) {
        console.error('Get Chat History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
    }
};

/**
 * Get list of recent conversations for the current user
 */
exports.getRecentConversations = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Find recent messages involving the user
        const messages = await ChatMessage.find({
            $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
        })
        .sort({ createdAt: -1 })
        .populate('senderId', 'name avatar role')
        .populate('receiverId', 'name avatar role');

        // Group by the other user
        const conversations = [];
        const seenUsers = new Set();

        for (const msg of messages) {
            const otherUser = msg.senderId.id === currentUserId ? msg.receiverId : msg.senderId;
            if (!seenUsers.has(otherUser.id)) {
                conversations.push({
                    user: otherUser,
                    lastMessage: msg.content,
                    timestamp: msg.createdAt,
                    isRead: msg.senderId.id === currentUserId ? true : msg.isRead
                });
                seenUsers.add(otherUser.id);
            }
        }

        res.status(200).json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error('Get Recent Conversations Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
    }
};

/**
 * Assign a mentor to a student (Admin/Mentor only)
 */
exports.assignMentor = async (req, res) => {
    try {
        const { studentId, mentorId } = req.body;
        const requesterRole = req.user.role;

        if (requesterRole === 'student') {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const mentor = await User.findById(mentorId);
        if (!mentor || mentor.role !== 'mentor') {
            return res.status(404).json({ success: false, message: "Mentor not found" });
        }

        student.mentorId = mentorId;
        await student.save();

        res.status(200).json({
            success: true,
            message: `Mentor ${mentor.name} successfully assigned to ${student.name}`
        });
    } catch (error) {
        console.error('Assign Mentor Error:', error);
        res.status(500).json({ success: false, message: 'Failed to assign mentor' });
    }
};

/**
 * Search users to start a new chat
 */
exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ success: true, users: [] });
        }
        
        const users = await User.find({
            name: { $regex: q, $options: 'i' },
            _id: { $ne: req.user.id }
        })
        .select('name avatar role email')
        .limit(10);

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Search Users Error:', error);
        res.status(500).json({ success: false, message: 'Failed to search users' });
    }
};
/**
 * Delete a specific chat message
 */
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const currentUserId = req.user.id;

        const message = await ChatMessage.findById(messageId);

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        const receiverId = message.receiverId.toString();
        const senderId = message.senderId.toString();

        // Permission check
        let isAuthorized = false;

        // 1. Sender can always delete
        if (senderId === currentUserId) isAuthorized = true;

        // 2. Admin can always delete
        if (req.user.role === 'admin') isAuthorized = true;

        // 3. Mentor can delete if they are the assigned mentor for the student in the chat
        if (!isAuthorized && req.user.role === 'mentor') {
            const studentId = message.role === 'student' ? senderId : receiverId;
            const student = await User.findById(studentId);
            if (student && student.mentorId && student.mentorId.toString() === currentUserId) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this message' });
        }

        await ChatMessage.findByIdAndDelete(messageId);

        // Notify both parties via socket
        const io = req.app.get('io');
        if (io) {
            io.to(senderId).emit('message_deleted', { messageId });
            io.to(receiverId).emit('message_deleted', { messageId });
        }

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Delete Message Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete message' });
    }
};
