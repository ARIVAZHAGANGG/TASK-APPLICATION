const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const supportController = require("../controllers/support.controller");
const authMiddleware = require("../middleware/auth.middleware");

// GET /api/ai/productivity/:userId
router.get("/productivity/:userId", authMiddleware, (req, res) => aiController.getProductivityScore(req, res));

// POST /api/ai/chat (Real dynamic AI chat)
router.post("/chat", authMiddleware, (req, res) => supportController.handleSupportChat(req, res));

// POST /api/ai/suggest-reminder
router.post("/suggest-reminder", authMiddleware, (req, res) => aiController.suggestReminder(req, res));

// POST /api/ai/voice-command
router.post("/voice-command", authMiddleware, (req, res) => aiController.handleVoiceCommand(req, res));

// POST /api/ai/task-intelligence
router.post("/task-intelligence", authMiddleware, (req, res) => aiController.handleTaskIntelligence(req, res));

module.exports = router;
