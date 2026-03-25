const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    // Foreign Key → Tasks Table
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    // Foreign Key → Users Table (student who submitted)
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Keep legacy field for backward compatibility
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // File submission link (Google Drive, S3, etc.)
    uploadedFileLink: {
      type: String,
      trim: true,
      default: null,
    },
    // Text-based answer (optional, for inline submissions)
    answer: {
      type: String,
      default: null,
    },
    // Date of submission
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    // Approval workflow status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "submitted"],
      default: "pending",
    },
    // Mentor or Admin who reviewed the submission
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Review feedback / comments
    reviewNote: {
      type: String,
      default: null,
    },
    // Date when review was completed
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for performance
submissionSchema.index({ taskId: 1, studentId: 1 }); // Unique submission per student per task
submissionSchema.index({ taskId: 1, status: 1 });
submissionSchema.index({ studentId: 1, status: 1 });
submissionSchema.index({ reviewedBy: 1 });

submissionSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model("Submission", submissionSchema);
