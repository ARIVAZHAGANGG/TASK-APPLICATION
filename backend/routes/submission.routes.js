const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  submitTask,
  getSubmissionsByTask,
  getMySubmissions,
  reviewSubmission,
  getSubmission,
  getSubmissionStats,
} = require("../controllers/submission.controller");

// ── Student routes ─────────────────────────────────────────────────────────────
// POST /api/submissions/task/:taskId  → Submit a task
router.post("/task/:taskId", auth, roleMiddleware("student"), submitTask);

// GET /api/submissions/my  → Get current student's submissions
router.get("/my", auth, roleMiddleware("student"), getMySubmissions);

// ── Shared routes ─────────────────────────────────────────────────────────────
// GET /api/submissions/stats  → Submission statistics (mentor / admin)
router.get("/stats", auth, roleMiddleware("mentor", "admin"), getSubmissionStats);

// GET /api/submissions/:submissionId  → Get a single submission
router.get("/:submissionId", auth, getSubmission);

// ── Mentor / Admin routes ─────────────────────────────────────────────────────
// GET /api/submissions/task/:taskId  → Get all submissions for a task
router.get("/task/:taskId", auth, roleMiddleware("mentor", "admin"), getSubmissionsByTask);

// PATCH /api/submissions/:submissionId/review  → Review (approve/reject) a submission
router.patch(
  "/:submissionId/review",
  auth,
  roleMiddleware("mentor", "admin"),
  reviewSubmission
);

module.exports = router;
