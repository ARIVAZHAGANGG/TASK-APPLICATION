const mongoose = require('mongoose');
require('dotenv').config();
const Question = require('./models/Question');
const User = require('./models/user.model');

const seedQuestions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find an admin to be the creator
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('No admin user found to attribute questions to. Please create an admin first.');
            process.exit(1);
        }

        const initialQuestions = [
            // Student Questions
            {
                question: "How do I earn more XP?",
                answer: "You can earn XP by completing tasks before their target date and maintaining a high productivity streak.",
                targetRole: "student",
                category: "engagement",
                createdBy: admin._id
            },
            {
                question: "Can I request a task extension?",
                answer: "Yes, you can use the Task Chat to message your mentor and request a deadline extension for any objective.",
                targetRole: "student",
                category: "tasks",
                createdBy: admin._id
            },
            // Mentor Questions
            {
                question: "How do I monitor student progress?",
                answer: "Use the 'Students' registry to see real-time productivity scores and click 'View Tasks' to see their individual board.",
                targetRole: "mentor",
                category: "oversight",
                createdBy: admin._id
            },
            {
                question: "How do I assign bulk tasks?",
                answer: "Navigate to 'Assign Tasks', select multiple students from the registry, and deploy the objective to all of them at once.",
                targetRole: "mentor",
                category: "efficiency",
                createdBy: admin._id
            },
            // Admin Questions
            {
                question: "How do I manage system-wide settings?",
                answer: "Go to the Settings page to configure global task types, notification preferences, and team workspaces.",
                targetRole: "admin",
                category: "system",
                createdBy: admin._id
            },
            // General Questions
            {
                question: "What is Focus Mode?",
                answer: "Focus Mode minimizes distractions by hiding the sidebar and showing only your current high-priority objective.",
                targetRole: "all",
                category: "features",
                createdBy: admin._id
            }
        ];

        await Question.deleteMany({}); // Optional: clear existing
        await Question.insertMany(initialQuestions);

        console.log('Initial tactical intelligence seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedQuestions();
