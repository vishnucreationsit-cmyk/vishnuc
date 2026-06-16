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
  sendManagerCredentials,
  getOrders,
  getAttendance,
  createEmployee,
  getEmployees,
  toggleEmployeeStatus,
  deleteEmployee,
  sendEmployeeCredentials,
  getEmailLogs,
  retryEmail
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
router.post('/managers/:id/send-credentials', auditActivity('MANAGER'), sendManagerCredentials);

// Employees
router.route('/employees')
  .get(getEmployees)
  .post(auditActivity('EMPLOYEE'), createEmployee);

router.route('/employees/:id')
  .delete(auditActivity('EMPLOYEE'), deleteEmployee);

router.patch('/employees/:id/status', auditActivity('EMPLOYEE'), toggleEmployeeStatus);
router.post('/employees/:id/send-credentials', auditActivity('EMPLOYEE'), sendEmployeeCredentials);

// Data Viewers
router.get('/orders', getOrders);
router.get('/orders/export', exportOrdersToExcel);
router.get('/attendance', getAttendance);

// Email Logs
router.get('/emails', getEmailLogs);
router.post('/emails/:id/retry', retryEmail);

module.exports = router;
