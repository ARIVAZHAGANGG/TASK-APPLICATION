const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const Task = require('./models/Task');

async function checkTasks() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const tasks = await Task.find({}).sort({ createdAt: -1 }).limit(5).lean();
        fs.writeFileSync('tasks_full_debug.json', JSON.stringify(tasks, null, 2));
        console.log('Saved 5 tasks to tasks_full_debug.json');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkTasks();
