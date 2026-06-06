try {
  const app = require('../src/app');
  module.exports = app;
} catch (err) {
  module.exports = (req, res) => {
    res.status(500).json({
      error: "Failed to initialize Express app",
      message: err.message,
      stack: err.stack
    });
  };
}
