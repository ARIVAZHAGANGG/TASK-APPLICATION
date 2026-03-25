const mongoose = require('mongoose');
require('dotenv').config();
const Task = require('./models/Task');

async function simulateMentorFetch() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const mentorId = "69b4e22fee5f38bdf39e31b6"; // Mentor One
        const userId = new mongoose.Types.ObjectId(mentorId);

        const query = {
            $or: [
                { createdBy: userId },
                { assignedToUserId: userId },
                { assignedTo: userId }
            ]
        };

        const tasksCount = await Task.countDocuments(query);
        const tasks = await Task.find(query).lean();

        console.log(`Mentor ID: ${mentorId}`);
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

simulateMentorFetch();
