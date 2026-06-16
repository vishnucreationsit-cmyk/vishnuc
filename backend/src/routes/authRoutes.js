const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { registerUser, loginUser, logoutUser, refreshToken, employeeLogin, sendAdminOtp, verifyAdminOtp, emergencySeed } = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Input Validation Middlewares
const validateRegistration = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Public Routes
router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/employee-login', employeeLogin);
router.post('/admin-send-otp', sendAdminOtp);
router.post('/admin-verify-otp', verifyAdminOtp);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);

// --- Example Protected Routes --- //

// Any authenticated user
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'Profile accessed', user: req.user });
});

// Manager and Admin only
router.get('/manager-dashboard', protect, authorizeRoles('ADMIN', 'MANAGER'), (req, res) => {
  res.json({ message: 'Manager dashboard accessed' });
});

// Admin only
router.get('/admin-dashboard', protect, authorizeRoles('ADMIN'), (req, res) => {
  res.json({ message: 'Admin dashboard accessed' });
});

// IMPORTANT: Emergency Seed Endpoint
// This allows the user to force-seed the admin directly on the live site
router.get('/emergency-seed', emergencySeed);

module.exports = router;
