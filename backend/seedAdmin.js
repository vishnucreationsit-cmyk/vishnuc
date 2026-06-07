require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if user exists
    const existingAdmin = await User.findOne({ email: 'cheshwar4400@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const admin = new User({
      name: 'Eshwar',
      email: 'cheshwar4400@gmail.com',
      password: 'Eshwar@123',
      role: 'ADMIN',
      pin: '1234',
      status: 'ACTIVE'
    });

    await admin.save();
    console.log('Admin user Eshwar inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error inserting admin:', err);
    process.exit(1);
  }
};

seedAdmin();
