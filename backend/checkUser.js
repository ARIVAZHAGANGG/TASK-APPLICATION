const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user.model');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const count = await User.countDocuments();
        console.log(`Total Users: ${count}`);

        const users = await User.find({}, 'name email role');
        console.log('Users:', JSON.stringify(users, null, 2));

        // Also check for specific user
        const emailToCheck = "arivu@gmail.com";
        const specificUser = await User.findOne({ email: emailToCheck });
        if (specificUser) {
            console.log(`\nFound user ${emailToCheck}:`);
            console.log(`ID: ${specificUser._id}`);
            console.log(`Password Hash: ${specificUser.password.substring(0, 10)}...`);
        } else {
            console.log(`\nUser ${emailToCheck} NOT FOUND.`);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
