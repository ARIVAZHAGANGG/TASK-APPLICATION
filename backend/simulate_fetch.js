const mongoose = require('mongoose');
require('dotenv').config();
const Task = require('./models/Task');

async function simulateStudentFetch() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const studentId = "69b4e230ee5f38bdf39e31bc"; // Student One
        const userId = new mongoose.Types.ObjectId(studentId);

        const query = {
            $or: [
                { createdBy: userId },
                { assignedToUserId: userId },
                { assignedTo: userId }
            ]
        };

        const tasksCount = await Task.countDocuments(query);
        const tasks = await Task.find(query).lean();

        console.log(`User ID: ${studentId}`);
        console.log(`Tasks Count found by query: ${tasksCount}`);
        console.log('--- Tasks ---');
        tasks.forEach(t => {
            console.log(`Title: ${t.title}, Status: ${t.status}, AssignedToUserId: ${t.assignedToUserId}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

simulateStudentFetch();
