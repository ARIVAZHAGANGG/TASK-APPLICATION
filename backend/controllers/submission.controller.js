const Submission = require("../models/Submission");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const User = require("../models/user.model");

// ─── Submit a task (Student) ──────────────────────────────────────────────────
exports.submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const studentId = req.user._id;
    const { uploadedFileLink, answer } = req.body;

    // Verify the task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Check if already submitted
    const existing = await Submission.findOne({ taskId, studentId });
    if (existing) {
      return res.status(409).json({ success: false, message: "Already submitted for this task" });
    }

    const submission = await Submission.create({
      taskId,
      studentId,
      submittedBy: studentId, // backward compat
      uploadedFileLink: uploadedFileLink || null,
      answer: answer || null,
      submissionDate: new Date(),
      status: "pending",
    });

    // Notify the assigner or creator
    const student = await User.findById(studentId);
    const notificationTarget = task.assignedByUserId || task.createdBy;
    
    if (notificationTarget && notificationTarget.toString() !== studentId.toString()) {
        await Notification.create({
            userId: notificationTarget,
            type: 'task_comment', // Reusing task_comment for now or we can add 'task_submitted' if exists
            title: 'Task Submission received 📥',
            message: `${student?.name || 'A student'} submitted work for: "${task.title}"`,
            link: `/board`,
            taskId: task._id,
            metadata: {
                submissionId: submission._id
            }
        });
    }

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    console.error("submitTask error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get all submissions for a task (Admin / Mentor) ─────────────────────────
exports.getSubmissionsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const submissions = await Submission.find({ taskId })
      .populate("studentId", "name email department batch role")
      .populate("reviewedBy", "name email role")
      .sort({ submissionDate: -1 });

    res.status(200).json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    console.error("getSubmissionsByTask error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get all submissions by the current student ───────────────────────────────
exports.getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user._id;

    const submissions = await Submission.find({ studentId })
      .populate("taskId", "title description status priority deadlineDate")
      .populate("reviewedBy", "name email role")
      .sort({ submissionDate: -1 });

    res.status(200).json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    console.error("getMySubmissions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Review a submission (Mentor / Admin) ─────────────────────────────────────
exports.reviewSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const reviewerId = req.user._id;
    const { status, reviewNote } = req.body;

    const allowed = ["approved", "rejected", "pending"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(", ")}` });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    submission.status = status;
    submission.reviewedBy = reviewerId;
    submission.reviewNote = reviewNote || null;
    submission.reviewedAt = new Date();
    await submission.save();

    const populated = await Submission.findById(submissionId)
      .populate("studentId", "name email department batch")
      .populate("reviewedBy", "name email role");

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    console.error("reviewSubmission error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get a single submission ──────────────────────────────────────────────────
exports.getSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
      .populate("taskId", "title description deadline status priority")
      .populate("studentId", "name email department batch role")
      .populate("reviewedBy", "name email role");

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    console.error("getSubmission error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get submission stats (Admin / Mentor) ────────────────────────────────────
exports.getSubmissionStats = async (req, res) => {
  try {
    const stats = await Submission.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = { pending: 0, approved: 0, rejected: 0, submitted: 0 };
    stats.forEach((s) => {
      formatted[s._id] = s.count;
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("getSubmissionStats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
