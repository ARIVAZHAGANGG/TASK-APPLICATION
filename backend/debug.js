const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');
const User = require('./models/user.model');

const calculateActivityProductivityScore = (tasks) => {
    let earnedScore = 0;
    let totalPriority = 0;

    const priorityWeights = { low: 1, medium: 2, high: 3, critical: 4 };

    tasks.forEach(task => {
        const priority = priorityWeights[task.priority] || 2;
        totalPriority += priority;
        console.log(`Task Priority: ${priority}, totalPriority now: ${totalPriority}`);

        let completionFactor = 0;
        if (task.completed) {
            completionFactor = 1;
        } else if (task.subtasks && task.subtasks.length > 0) {
            const completedSubtasks = task.subtasks.filter(st => st.completed).length;
            if (completedSubtasks > 0) {
                completionFactor = 0.5;
            }
        }
        console.log(`Task Completed: ${task.completed}, completionFactor: ${completionFactor}`);

        let timeFactor = 1;
        if (task.dueDate) {
            const checkDate = new Date(task.completed ? (task.completedAt || task.updatedAt) : new Date());
            const dueDate = new Date(task.dueDate);
            
            if (checkDate > dueDate) {
                const diffTime = checkDate.getTime() - dueDate.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                
                if (diffDays > 3) {
                    timeFactor = 0.2;
                } else {
                    timeFactor = 0.5;
                }
            }
        }
        console.log(`Task dueDate: ${task.dueDate}, timeFactor: ${timeFactor}`);

        const taskScore = priority * completionFactor * timeFactor;
        earnedScore += taskScore;
        console.log(`Earned score added: ${taskScore}, Total Earned: ${earnedScore}`);
    });

    if (totalPriority === 0) return 0;
    
    return Number(((earnedScore / totalPriority) * 100).toFixed(2));
};

async function test() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://arivazhagang2003:sZt0QyZ2RStD8xJd@cluster0.z1pwb.mongodb.net/premium-task-app?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    
    const student = await User.findOne({ email: 'student1@test.com' }) || await User.findOne({ name: /student one/i });
    if(!student) {
        console.log("Could not find Student One");
        process.exit();
    }
    console.log("Found Student:", student.name, student.email, student._id);

    const query = { 
        $or: [{ assignedToUserId: student._id }, { assignedTo: student._id }] 
    };

    const tasks = await Task.find(query).select('priority completed subtasks dueDate completedAt updatedAt status').lean();
    console.log(`Found ${tasks.length} tasks for this student.`);
    
    console.log("Raw Tasks:");
    console.log(JSON.stringify(tasks, null, 2));

    const finalScore = calculateActivityProductivityScore(tasks);
    console.log(`Final Calculated Score: ${finalScore}%`);
    process.exit(0);
}

test();
