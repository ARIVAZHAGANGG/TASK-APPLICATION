const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/students',
  method: 'GET',
  headers: {} // I don't have a token, so I might get 401. 
};

// Let's just create a modified app.js or query the DB using the EXACT controller function natively.
const mongoose = require('mongoose');
require('dotenv').config();

const taskController = require('./controllers/task.controller');
const User = require('./models/user.model');

async function testController() {
  await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  });
  
  const student = await User.findOne({ email: 'student1@taskflow.com' });

  const req = {
    user: { id: student._id.toString(), role: 'student' },
    query: {}
  };
  
  const res = {
    json: (data) => {
      console.log("Stats Data:", JSON.stringify(data, null, 2));
      process.exit(0);
    },
    status: (code) => {
      console.log("Status:", code);
      return { json: (msg) => { console.log("Msg:", msg); process.exit(1); } };
    }
  };

  await taskController.getTaskStats(req, res);
}

testController();
