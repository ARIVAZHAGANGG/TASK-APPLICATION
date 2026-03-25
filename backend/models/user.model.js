const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "mentor", "admin"],
      default: "student",
    },
    // Organizational Info
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
    // Gamification & Analytics
    streak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastCompletionDate: Date,
    productivityScore: {
      type: Number,
      default: 0
    },
    manualProductivityOverride: {
      type: Number,
      default: null
    },
    productivityLastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    productivityLastUpdatedAt: Date,
    totalTasksDone: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    achievements: [{
      achievementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement'
      },
      unlockedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Profile & Preferences
    avatar: String,
    bio: String,
    currentWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace'
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
      },
      emailNotifications: {
        type: Boolean,
        default: true
      },
      pushNotifications: {
        type: Boolean,
        default: true
      },
      soundEnabled: {
        type: Boolean,
        default: true
      }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastActive: Date,
    staffId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple nulls for students
      validate: {
        validator: function(v) {
          if (this.role === 'student') {
            return v === null || v === undefined;
          }
          return typeof v === 'string' && v.trim().length > 0;
        },
        message: props => `${props.value} is not a valid staff ID for role ${this.role}!`
      }
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔑 Generate Password Reset Token
const crypto = require("crypto");

userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (15 minutes)
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

// Indexes for performance
userSchema.index({ role: 1 });
userSchema.index({ department: 1, batch: 1 });

userSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model("User", userSchema);
