const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./backend/models/user.model');

async function testUpdate() {
    dotenv.config({ path: path.join(__dirname, '.env') });
    if (!process.env.MONGO_URI) {
        dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const student = await User.findOne({ role: 'student' });
    if (!student) {
        console.log('No student found');
        await mongoose.connection.close();
        return;
    }
    
    console.log(`Updating student: ${student.name} (ID: ${student._id})`);
    
    const res = await User.updateOne(
        { _id: student._id },
        { $set: { year: "2nd", department: "Testing Dept" } }
    );
    
    console.log('Update result:', res);
    
    const updated = await User.findById(student._id).select('name year department').lean();
    console.log('Updated Student:', updated);
    
    await mongoose.connection.close();
}

testUpdate();
