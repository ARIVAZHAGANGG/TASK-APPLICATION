const mongoose = require('mongoose');
require('dotenv').config();

async function checkTasks() {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully.");
        
        const Task = require('./models/Task');
        const count = await Task.countDocuments();
        console.log("Total Tasks document count: " + count);
        
        const allTasks = await Task.find({}).limit(10);
        console.log("Found " + allTasks.length + " tasks in query.");
        
        if (allTasks.length > 0) {
            console.log("First task title: " + allTasks[0].title);
            console.log("First task createdBy: " + allTasks[0].createdBy);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("❌ Diagnostic Error:", error);
    }
}

checkTasks();
