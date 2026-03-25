const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskapp');
        console.log('Connected to MongoDB');

        const users = [
            {
                name: 'System Admin',
                email: 'admin@taskflow.com',
                password: 'admin123',
                role: 'admin',
                staffId: 'ADMIN001'
            },
            {
                name: 'Mentor One',
                email: 'mentor1@taskflow.com',
                password: 'mentor123',
                role: 'mentor',
                staffId: 'MNT001'
            },
            {
                name: 'Student One',
                email: 'student1@taskflow.com',
                password: 'student123',
                role: 'student'
            }
        ];

        // Option: Clear existing users to match exactly the 3 requested
        // Let's just update or create them to be safe, but since user said "add only these 3", 
        // I will stick to ensuring these 3 are correct.
        
        for (const u of users) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                await User.create(u);
                console.log(`Created user: ${u.email} (${u.role})`);
            } else {
                // Update password and role to be sure
                exists.password = u.password;
                exists.role = u.role;
                await exists.save();
                console.log(`Updated user: ${u.email}`);
            }
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
