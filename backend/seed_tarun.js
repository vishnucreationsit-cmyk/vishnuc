require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const adminData = {
      name: 'tarun',
      email: 'tarunsaikolaa@gmail.com',
      password: 'tarun@123',
      role: 'ADMIN',
      pin: '1234',
      status: 'ACTIVE'
    };

    let user = await User.findOne({ email: 'tarunsaikolaa@gmail.com' });
    if (user) {
      user.name = adminData.name;
      user.password = adminData.password;
      user.role = adminData.role;
      user.pin = adminData.pin;
      user.status = adminData.status;
      await user.save();
      console.log('Admin user Tarun updated successfully!');
    } else {
      await User.create(adminData);
      console.log('Admin user Tarun created successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();
