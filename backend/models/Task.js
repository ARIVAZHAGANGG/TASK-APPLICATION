const mongoose = require("mongoose");

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { _id: true });

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    dueDate: Date,
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed", "assigned"],
      default: "todo"
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    tags: [{ type: String, trim: true }],
    subtasks: [subtaskSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    pinned: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      enum: ["Development", "Research", "Documentation", "Testing", "Design", "Bug Fix", "General", "Personal"],
      default: "General",
      index: true
    },
    // Smart Features
    estimatedHours: {
      type: Number,
      default: 0
    },
    estimatedTime: {
      type: Number, // in minutes
      default: 60
    },
    actualTime: {
      type: Number, // in minutes
      default: 0
    },
    complexity: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Critical"],
      default: "Medium"
    },
    skillsRequired: [{
      type: String,
      trim: true
    }],
    attachments: [{
      name: String,
      url: String,
      fileType: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    }],
    reviewType: {
      type: String,
      enum: ["Mentor Review", "Admin Review", "Auto Completion"],
      default: "Mentor Review"
    },
    productivityWeight: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    visibility: {
      type: String,
      enum: ["Private", "Team Visible", "Public"],
      default: "Private"
    },
    clonable: {
      type: Boolean,
      default: false
    },
    delegatable: {
      type: Boolean,
      default: false
    },
    isRepeated: {
      type: Boolean,
      default: false
    },
    awaitSubtaskCompletion: {
      type: Boolean,
      default: false
    },
    documentationRequired: {
      type: Boolean,
      default: false
    },
    recurrenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurrencePattern"
    },
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    }],
    isBlocked: {
      type: Boolean,
      default: false
    },
    // Reminders
    reminderDate: Date,
    reminderEnabled: {
      type: Boolean,
      default: false
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    // Advanced Notifications & Recurrence
    recurrence: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly"],
      default: "none",
    },
    recurrenceInterval: {
      type: Number,
      default: 1,
    },
    phoneNumber: String, // For SMS reminders
    smsEnabled: {
      type: Boolean,
      default: false
    },
    assignedByStaffId: {
      type: String,
      index: true
    },
    // Hierarchical Task Assignment
    createdByRole: {
      type: String,
      enum: ["admin", "mentor", "student"],
      default: "student"
    },
    assignedToRole: {
      type: String,
      enum: ["mentor", "student", "none"],
      default: "none"
    },
    assignedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    assignedToUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    parentTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      index: true
    },
    documentationUrl: String,
    targetDate: Date,
    targetTime: String,
    assignDate: {
      type: Date,
      default: Date.now
    },
    taskType: {
      type: String,
      enum: ["Assignment", "Project", "Quiz", "Lab Work", "Presentation", "Review", "Research", "Support"],
      default: "Assignment"
    },
    // Batch/Department assignment scope
    targetType: {
      type: String,
      enum: ["All", "Specific Batch", "Individual"],
      default: "Individual",
      index: true,
    },
    department: {
      type: String,
      trim: true,
      default: null,
    },
    batch: {
      type: String,
      trim: true,
      default: null,
    },
    // Explicit deadline date (alias for dueDate, kept for API compatibility)
    deadlineDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
taskSchema.index({ createdBy: 1, completed: 1 });
taskSchema.index({ createdBy: 1, priority: 1 });
taskSchema.index({ createdBy: 1, status: 1 });
// Compound indexes for optimal query performance
taskSchema.index({ createdBy: 1, priority: 1, completed: 1 }); // Important tasks filter
taskSchema.index({ createdBy: 1, dueDate: 1 }); // Due date sorting
taskSchema.index({ createdBy: 1, category: 1 }); // Category filtering
taskSchema.index({ createdBy: 1, createdAt: -1 }); // Default sorting (newest first)
taskSchema.index({ tags: 1 }); // Tag search
taskSchema.index({ assignedTo: 1, completed: 1 }); // Team tasks
// Assignment & scope indexes
taskSchema.index({ assignedByUserId: 1, status: 1 }); // Tasks assigned by a user
taskSchema.index({ assignedToUserId: 1, status: 1 }); // Tasks assigned to a user
taskSchema.index({ targetType: 1, department: 1, batch: 1 }); // Batch/Department scoped tasks
taskSchema.index({ deadlineDate: 1 }); // Deadline queries

// Virtual for subtask progress
taskSchema.virtual('subtaskProgress').get(function () {
  if (!this.subtasks || this.subtasks.length === 0) return 0;
  const completedCount = this.subtasks.filter(st => st.completed).length;
  return Math.round((completedCount / this.subtasks.length) * 100);
});

// Auto-update completedAt when task is marked complete
taskSchema.pre('save', function (next) {
  if (this.isModified('completed')) {
    if (this.completed && !this.completedAt) {
      this.completedAt = new Date();
      this.status = 'completed';
    } else if (!this.completed) {
      this.completedAt = null;
    }
  }
  next();
});

taskSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model("Task", taskSchema);

