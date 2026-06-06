const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  getDashboardStats,
  createManager,
  updateManager,
  toggleManagerStatus,
  deleteManager,
  getManagers,
  getOrders,
  getAttendance
} = require('../controllers/adminController');
const { auditActivity } = require('../middlewares/auditMiddleware');
const { exportOrdersToExcel } = require('../controllers/exportController');

// All routes here require ADMIN role
router.use(protect, authorizeRoles('ADMIN'));

// Dashboard Stats
router.get('/stats', getDashboardStats);

// Managers
router.route('/managers')
  .get(getManagers)
  .post(auditActivity('MANAGER'), createManager);

router.route('/managers/:id')
  .put(auditActivity('MANAGER'), updateManager)
  .delete(auditActivity('MANAGER'), deleteManager);

router.patch('/managers/:id/status', auditActivity('MANAGER'), toggleManagerStatus);

// Data Viewers
router.get('/orders', getOrders);
router.get('/orders/export', exportOrdersToExcel);
router.get('/attendance', getAttendance);

module.exports = router;
