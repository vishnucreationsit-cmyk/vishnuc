require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() => {
  return mongoose.connection.db.collection('users').updateOne(
    { email: 'tarunsaikolaa@gmail.com' },
    { $set: { password: 'tarun@123', pin: '1234' } }
  );
}).then(res => {
  console.log('Updated:', res);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
