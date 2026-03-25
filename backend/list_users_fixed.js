const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user.model');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'name email role');
        console.log('--- Current Users ---');
        console.log(JSON.stringify(users, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listUsers();
