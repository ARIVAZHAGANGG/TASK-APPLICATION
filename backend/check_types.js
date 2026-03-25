const mongoose = require('mongoose');
require('dotenv').config();
const Task = require('./models/Task');

async function checkTypes() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const taskId = "69b77ccb49c798aa2dc091b1";
        const t = await Task.findById(taskId).lean();
        if (t) {
            console.log('--- Type Analysis ---');
            console.log(`Title: ${t.title}`);
            console.log(`assignedToUserId type in record: ${Object.prototype.toString.call(t.assignedToUserId)}`);
            console.log(`Value: ${t.assignedToUserId}`);
            
            // Check if it matches when queried as ObjectId vs String
            const objMatch = await Task.findOne({ _id: taskId, assignedToUserId: new mongoose.Types.ObjectId(t.assignedToUserId.toString()) });
            const strMatch = await Task.findOne({ _id: taskId, assignedToUserId: t.assignedToUserId.toString() });
            
            console.log(`Match with ObjectId: ${!!objMatch}`);
            console.log(`Match with String: ${!!strMatch}`);
        } else {
            console.log(`Task with ID ${taskId} not found.`);
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkTypes();
