const User = require("../models/user.model");
const Task = require("../models/Task");

exports.getStaffMembers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : { role: { $in: ["mentor", "admin"] } };
    
    const staff = await User.find(filter)
      .select("name email role staffId createdAt avatar")
      .sort({ createdAt: -1 })
      .lean();
      
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    // 🚀 Performance Optimization: Using Aggregation Pipeline to calculate scores in bulk
    // This avoids the N+1 query problem where we queried tasks for EACH student.
    const studentsWithScores = await User.aggregate([
      { $match: { role: "student" } },
      {
        $lookup: {
          from: "tasks",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$assignedToUserId", "$$studentId"] },
                    { $eq: ["$assignedTo", "$$studentId"] }
                  ]
                }
              }
            },
            {
              $project: {
                priority: 1,
                completed: 1,
                subtasks: 1,
                dueDate: 1,
                completedAt: 1,
                updatedAt: 1
              }
            }
          ],
          as: "tasks"
        }
      },
      {
        $addFields: {
          id: { $toString: "$_id" },
          scores: {
            $reduce: {
              input: "$tasks",
              initialValue: { earnedScore: 0, totalPriority: 0 },
              in: {
                $let: {
                  vars: {
                    priorityWeight: {
                      $switch: {
                        branches: [
                          { case: { $eq: ["$$this.priority", "low"] }, then: 1 },
                          { case: { $eq: ["$$this.priority", "medium"] }, then: 2 },
                          { case: { $eq: ["$$this.priority", "high"] }, then: 3 },
                          { case: { $eq: ["$$this.priority", "critical"] }, then: 4 }
                        ],
                        default: 2
                      }
                    },
                    completionFactor: {
                      $cond: [
                        "$$this.completed",
                        1,
                        {
                          $cond: [
                            { $gt: [{ $size: { $ifNull: ["$$this.subtasks", []] } }, 0] },
                            {
                              $cond: [
                                { $gt: [{ $size: { $filter: { input: { $ifNull: ["$$this.subtasks", []] }, as: "st", cond: "$$st.completed" } } }, 0] },
                                0.5,
                                0
                              ]
                            },
                            0
                          ]
                        }
                      ]
                    },
                    // Simplified Time Factor for Aggregation
                    timeFactor: {
                       $cond: [
                         { $not: ["$$this.dueDate"] },
                         1,
                         {
                           $let: {
                             vars: {
                               checkDate: { $ifNull: ["$$this.completedAt", "$$this.updatedAt"] },
                               dueDate: "$$this.dueDate"
                             },
                             in: {
                               $cond: [
                                 { $gt: ["$$checkDate", "$$dueDate"] },
                                 0.5,
                                 1
                               ]
                             }
                           }
                         }
                       ]
                    }
                  },
                  in: {
                    earnedScore: { $add: ["$$value.earnedScore", { $multiply: ["$$priorityWeight", "$$completionFactor", "$$timeFactor"] }] },
                    totalPriority: { $add: ["$$value.totalPriority", "$$priorityWeight"] }
                  }
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          calculatedProductivityScore: {
            $cond: [
              { $eq: ["$scores.totalPriority", 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ["$scores.earnedScore", "$scores.totalPriority"] }, 100] }, 2] }
            ]
          }
        }
      },
      {
        $project: {
          password: 0,
          tasks: 0,
          scores: 0
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json(studentsWithScores.map(s => ({ ...s, productivityScore: s.calculatedProductivityScore })));
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
