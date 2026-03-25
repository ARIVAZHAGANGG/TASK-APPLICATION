const User = require("../models/user.model");
const Task = require("../models/Task");

exports.getStaffMembers = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ["mentor", "admin"] } })
      .select("name email role staffId createdAt")
      .sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("name email avatar createdAt department batch manualProductivityOverride productivityLastUpdatedBy productivityLastUpdatedAt")
      .sort({ name: 1 })
      .lean();

    const studentsWithScores = await Promise.all(students.map(async (student) => {
      const tasks = await Task.find({ 
        $or: [{ assignedToUserId: student._id }, { assignedTo: student._id }] 
      }).select('priority completed subtasks dueDate completedAt updatedAt').lean();
      
      let earnedScore = 0;
      let totalPriority = 0;
      const priorityWeights = { low: 1, medium: 2, high: 3, critical: 4 };

      tasks.forEach(task => {
          const priority = priorityWeights[task.priority] || 2;
          totalPriority += priority;

          let completionFactor = 0;
          if (task.completed) {
              completionFactor = 1;
          } else if (task.subtasks && task.subtasks.length > 0) {
              const completedSubtasks = task.subtasks.filter(st => st.completed).length;
              if (completedSubtasks > 0) {
                  completionFactor = 0.5;
              }
          }

          let timeFactor = 1;
          if (task.dueDate) {
              const checkDate = new Date(task.completed ? (task.completedAt || task.updatedAt) : new Date());
              const dueDate = new Date(task.dueDate);
              
              if (checkDate > dueDate) {
                  const diffTime = checkDate.getTime() - dueDate.getTime();
                  const diffDays = diffTime / (1000 * 60 * 60 * 24);
                  
                  if (diffDays > 3) {
                      timeFactor = 0.2; // Very Late
                  } else {
                      timeFactor = 0.5; // Late
                  }
              }
          }

          const taskScore = priority * completionFactor * timeFactor;
          earnedScore += taskScore;
      });

      const calculatedScore = totalPriority === 0 ? 0 : Number(((earnedScore / totalPriority) * 100).toFixed(2));

      return {
        ...student,
        calculatedProductivityScore: calculatedScore,
        productivityScore: calculatedScore // ALWAYS dynamic, no manual overrides per new objective
      };
    }));

    res.json(studentsWithScores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudentDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { department } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'mentor') {
      return res.status(403).json({ message: "Not authorized to modify students" });
    }

    const student = await User.findByIdAndUpdate(
      id, 
      { $set: { department } }, 
      { new: true, runValidators: false }
    );
    
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Student department updated successfully", department: student.department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email staffId")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaffActivity = async (req, res) => {
  try {
    const activity = await Task.aggregate([
      { $match: { assignedByStaffId: { $ne: null } } },
      {
        $group: {
          _id: "$assignedByStaffId",
          taskCount: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] } },
          tasks: { $push: { title: "$title", status: "$status", createdAt: "$createdAt" } }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "staffId",
          as: "staffDetails"
        }
      },
      { $unwind: "$staffDetails" },
      {
        $project: {
          staffName: "$staffDetails.name",
          staffId: "$_id",
          taskCount: 1,
          completedTasks: 1,
          recentTasks: { $slice: ["$tasks", -5] }
        }
      }
    ]);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
