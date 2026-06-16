require('dotenv').config({ override: true });
const app = require('./src/app');
const connectDB = require('./src/config/db');

const { startEmailRetryService } = require('./src/utils/emailRetryService');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startEmailRetryService();
  });
});
