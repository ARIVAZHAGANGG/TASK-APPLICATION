const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/user.model');

async function checkAdmin() {
    try {
        const uri = process.env.MONGO_URI;
        console.log('Connecting to:', uri ? uri.substring(0, 20) + '...' : 'undefined');
        if (!uri) throw new Error('MONGO_URI is undefined. Check .env file and path.');
        
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ email: 'admin@taskflow.com' });
        if (admin) {
            console.log('Admin found:');
            console.log('ID:', admin._id);
            console.log('Name:', admin.name);
            console.log('Email:', admin.email);
            console.log('Role:', admin.role);
            console.log('Has password:', !!admin.password);
        } else {
            console.log('Admin user not found!');
        }

        const allUsers = await User.find({}, 'name email role');
        console.log('\nAll Users count:', allUsers.length);
        console.log(JSON.stringify(allUsers, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAdmin();
