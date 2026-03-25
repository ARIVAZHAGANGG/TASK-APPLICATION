const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const controller = require("../controllers/task.controller");

router.post("/", auth, (req, res) => controller.createTask(req, res));
router.get("/", auth, (req, res) => controller.getTasks(req, res));
router.get("/user", auth, (req, res) => controller.getUserTasks(req, res));
router.get("/stats", auth, (req, res) => controller.getTaskStats(req, res));
router.get("/priority-suggestion", auth, (req, res) => controller.getPrioritySuggestion(req, res));
router.get("/graph-data", auth, (req, res) => controller.getGraphData(req, res));
router.get("/admin-stats", auth, roleMiddleware('admin'), (req, res) => controller.getAdminStats(req, res));


// Kanban routes
router.get("/kanban", auth, (req, res) => controller.getKanbanTasks(req, res));

// Tag routes
router.get("/tags", auth, (req, res) => controller.getTags(req, res));
router.get("/tags/:tag", auth, (req, res) => controller.getTasksByTag(req, res));

// Overdue tasks
router.get("/overdue", auth, (req, res) => controller.getOverdueTasks(req, res));

// Subtask routes
router.post("/:id/subtasks", auth, (req, res) => controller.addSubtask(req, res));
router.put("/:id/subtasks/:subtaskId", auth, (req, res) => controller.toggleSubtask(req, res));
router.delete("/:id/subtasks/:subtaskId", auth, (req, res) => controller.deleteSubtask(req, res));

// Status update route
router.put("/:id/status", auth, (req, res) => controller.updateTaskStatus(req, res));

// General task routes
router.put("/batch-update", auth, (req, res) => controller.batchUpdateTasks(req, res));
router.put("/:id", auth, (req, res) => controller.updateTask(req, res));
router.delete("/:id", auth, (req, res) => controller.deleteTask(req, res));

// AI Suggestions
const analyticsController = require("../controllers/analytics.controller");

router.post("/breakdown", auth, (req, res) => controller.generateTaskBreakdown(req, res));
router.post("/ai/voice", auth, (req, res) => controller.createTaskFromVoice(req, res));
router.get("/analytics", auth, (req, res) => analyticsController.getAnalytics(req, res));
router.get("/:id/suggestions", auth, (req, res) => controller.getTaskSuggestions(req, res));
router.post("/:id/apply-suggestions", auth, (req, res) => controller.applyAISuggestions(req, res));

// Time Tracking
router.post("/:id/timer/start", auth, (req, res) => controller.startTimer(req, res));
router.post("/:id/timer/stop", auth, (req, res) => controller.stopTimer(req, res));
router.get("/timelogs", auth, (req, res) => controller.getTimeLogs(req, res));

// Pomodoro
router.post("/pomodoro/start", auth, (req, res) => controller.startPomodoroSession(req, res));
router.post("/pomodoro/:sessionId/complete", auth, (req, res) => controller.completePomodoroSession(req, res));
router.get("/pomodoro/stats", auth, (req, res) => controller.getPomodoroStats(req, res));

// Recurring Tasks
router.post("/:id/recurrence", auth, (req, res) => controller.createRecurringTask(req, res));
router.delete("/recurrence/:recurrenceId", auth, (req, res) => controller.stopRecurringTask(req, res));

// Dependencies
router.post("/:id/dependencies", auth, (req, res) => controller.addDependency(req, res));
router.delete("/:id/dependencies/:dependencyId", auth, (req, res) => controller.removeDependency(req, res));

// Reminders
router.put("/:id/reminder-sent", auth, (req, res) => controller.markReminderSent(req, res));

// Premium Actions
router.put("/:id/pin", auth, (req, res) => controller.togglePinned(req, res));
router.post("/:id/duplicate", auth, (req, res) => controller.duplicateTask(req, res));

// Attachments
router.post("/:id/attachments", auth, (req, res) => controller.uploadAttachment(req, res));
router.delete("/:id/attachments/:attachmentId", auth, (req, res) => controller.deleteAttachment(req, res));

module.exports = router;

