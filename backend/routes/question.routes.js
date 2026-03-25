const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const questionController = require('../controllers/question.controller');

// Public/Common routes (filtered by user role)
router.get('/', protect, (req, res) => questionController.getQuestions(req, res));

// Management routes (Admins and Mentors)
router.get('/manage', protect, (req, res) => questionController.getAllQuestionsAdmin(req, res));
router.post('/', protect, (req, res) => questionController.createQuestion(req, res));
router.put('/:id', protect, (req, res) => questionController.updateQuestion(req, res));
router.delete('/:id', protect, (req, res) => questionController.deleteQuestion(req, res));

module.exports = router;
