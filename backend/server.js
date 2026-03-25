const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
require("dotenv").config();

const connectDB = require("./config/db");
console.log("Importing routes...");
const authRoutes = require("./routes/auth.routes");
console.log("Auth routes imported");
const taskRoutes = require("./routes/task.routes");
console.log("Task routes imported");
const supportRoutes = require("./routes/support.routes");
console.log("Support routes imported");
const activityRoutes = require("./routes/activity.routes");
const gamificationRoutes = require("./routes/gamification.routes");
console.log("Activity routes imported");
const notificationRoutes = require("./routes/notification.routes");
console.log("Notification routes imported");

const app = express();

/* Connect MongoDB */
connectDB().then(() => {
  console.log("MongoDB Connected");

  // Start recurring tasks cron job
  const { startRecurrenceCron } = require('./jobs/recurrence.cron');
  startRecurrenceCron();

  // Start reminder cron job
  const initReminderCron = require('./jobs/reminder.cron');
  initReminderCron();
});

/* Middleware */
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(compression());

/* Routes */
console.log("Setting up routes...");
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai/support", supportRoutes);
app.use("/api/activity-log", activityRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/history", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/comments", require("./routes/comment.routes"));
app.use("/api/workspaces", require("./routes/workspace.routes"));
app.use("/api/billing", require("./routes/billing.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/questions", require("./routes/question.routes"));
app.use("/api/submissions", require("./routes/submission.routes"));
app.use("/api/chat", require("./routes/chat.routes"));
console.log("Routes set up!");


/* Server & Socket.io Setup */
const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ],
    credentials: true
  }
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_task', (taskId) => {
    socket.join(taskId);
    console.log(`User ${socket.id} joined task: ${taskId}`);
  });

  socket.on('leave_task', (taskId) => {
    socket.leave(taskId);
  });

  // Direct Messaging Socket Events
  socket.on('join_chat', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined personal chat room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible globally via app
app.set('io', io);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
