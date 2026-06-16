const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  getEmployees,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deliverOrder,
  getOrders,
  getOrderById,
  getAttendance,
  getDashboardStats,
  sendEmployeeCredentials
} = require('../controllers/managerController');
const { auditActivity } = require('../middlewares/auditMiddleware');
const { exportOrdersToExcel } = require('../controllers/exportController');

// All routes require MANAGER or ADMIN roles
router.use(protect, authorizeRoles('MANAGER', 'ADMIN'));

// Dashboard Stats
router.get('/stats', getDashboardStats);

// Employee Management
router.route('/employees')
  .get(getEmployees)
  .post(auditActivity('EMPLOYEE'), createEmployee);

router.route('/employees/:id')
  .put(auditActivity('EMPLOYEE'), updateEmployee);

router.patch('/employees/:id/status', auditActivity('EMPLOYEE'), toggleEmployeeStatus);
router.post('/employees/:id/send-credentials', auditActivity('EMPLOYEE'), sendEmployeeCredentials);

// Excel Export
router.get('/orders/export', exportOrdersToExcel);

// Order Management
router.route('/orders')
  .get(getOrders)
  .post(auditActivity('ORDER'), createOrder);

router.route('/orders/:id')
  .get(getOrderById)
  .put(auditActivity('ORDER'), updateOrder);

router.patch('/orders/:id/status', auditActivity('ORDER'), updateOrderStatus);
router.post('/orders/:id/deliver', auditActivity('ORDER'), deliverOrder);

// Attendance Management
router.get('/attendance', getAttendance);

module.exports = router;
