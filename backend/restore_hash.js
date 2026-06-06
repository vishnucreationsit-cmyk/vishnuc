require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() => {
  return mongoose.connection.db.collection('users').updateOne(
    { email: 'tarunsaikolaa@gmail.com' },
    { $set: { password: '$2b$10$EKGzk4UGP9uklocmsjdAU.4jHCPm8zh1PyooQbSBqiESwgAhQpvt.' } }
  );
}).then(() => {
  console.log('Restored hash');
  process.exit(0);
});
