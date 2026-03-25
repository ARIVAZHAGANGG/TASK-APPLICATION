const Question = require('../models/Question');

exports.createQuestion = async (req, res) => {
    try {
        const question = await Question.create({
            ...req.body,
            createdBy: req.user.id
        });
        res.status(201).json(question);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getQuestions = async (req, res) => {
    try {
        const { role } = req.user;
        let query = { isActive: true };

        // If not admin, filter by targetRole
        if (role !== 'admin') {
            query.targetRole = { $in: ['all', role] };
        }

        const questions = await Question.find(query).sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllQuestionsAdmin = async (req, res) => {
    try {
        // Admins and Mentors can manage questions
        const questions = await Question.find().sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!question) return res.status(404).json({ message: "Question not found" });
        res.json(question);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) return res.status(404).json({ message: "Question not found" });
        res.json({ message: "Question deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
