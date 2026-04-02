const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/user.model');

async function check() {
    dotenv.config({ path: path.join(__dirname, '.env') });
    await mongoose.connect(process.env.MONGO_URI);
    
    const users = await User.find({ role: 'student' }).select('name email year department').lean();
    console.log('Students in DB:');
    users.forEach(u => {
        console.log(`Name: ${u.name}, Year: ${u.year}, Dept: ${u.department}`);
    });
    
    await mongoose.connection.close();
}

check();
