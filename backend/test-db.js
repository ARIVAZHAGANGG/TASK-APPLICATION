const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('Attempting to connect to:', process.env.MONGO_URI.split('@')[1]); 
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('FAILURE: Could not connect to MongoDB');
    console.error(err);
    process.exit(1);
  }
}

testConnection();
