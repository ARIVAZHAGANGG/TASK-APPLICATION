const SupportMessage = require('../models/SupportMessage');
const aiService = require('../services/ai.service');

/**
 * Handle support chat and get AI response
 */
exports.handleSupportChat = async (req, res) => {
    try {
        const { message, context } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (userRole === 'student') {
            return res.status(403).json({ success: false, message: "AI Assistant is currently reserved for Mentors and Admins." });
        }

        // Save user message
        const userMsg = new SupportMessage({
            userId,
            message,
            role: 'user',
            context
        });
        await userMsg.save();

        // Get AI response
        let aiResponse;
        try {
            aiResponse = await aiService.getChatResponse(userId, message);
        } catch (error) {
            console.error('❌ AI Service Error:', error);
            aiResponse = "I'm currently having trouble connecting to my brain! 🧠 But I'm still here to help with your tasks. What can I do for you?";
        }

        // Save AI message
        const aiMsg = new SupportMessage({
            userId,
            message: aiResponse,
            role: 'ai',
            context
        });
        await aiMsg.save();

        res.status(200).json({
            success: true,
            message: aiResponse,
            history: [userMsg, aiMsg]
        });
    } catch (error) {
        console.error('❌ Support Chat Controller Error:', error);
        res.status(500).json({ success: false, message: 'Failed to process support request' });
    }
};

/**
 * Get support chat history
 */
exports.getSupportHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await SupportMessage.find({ userId })
            .sort({ timestamp: 1 })
            .limit(50);

        res.status(200).json({
            success: true,
            history
        });
    } catch (error) {
        console.error('Support History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch support history' });
    }
};
/**
 * Clear support chat history
 */
exports.clearSupportHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        await SupportMessage.deleteMany({ userId });

        res.status(200).json({
            success: true,
            message: 'Chat history cleared successfully'
        });
    } catch (error) {
        console.error('Clear Support History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear chat history' });
    }
};
