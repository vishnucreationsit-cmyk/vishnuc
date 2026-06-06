const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { checkIn, checkOut, getHistory, getMonthlyReport } = require('../controllers/employeeController');

// All routes require EMPLOYEE role
router.use(protect, authorizeRoles('EMPLOYEE'));

router.post('/attendance/check-in', checkIn);
router.post('/attendance/check-out', checkOut);
router.get('/attendance/history', getHistory);
router.get('/attendance/report', getMonthlyReport);

module.exports = router;
