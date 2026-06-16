const User = require('../models/User');
const Order = require('../models/Order');
const Attendance = require('../models/Attendance');
const EmailLog = require('../models/EmailLog');
const { retrySingleEmail } = require('../utils/emailRetryService');

// Helper for Pagination and Sorting
const getPaginationOptions = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30; // 30 records per page
  const skip = (page - 1) * limit;
  const sort = req.query.sort || '-createdAt';
  return { page, limit, skip, sort };
};

// 1. Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalManagers = await User.countDocuments({ role: 'MANAGER' });
    const totalEmployees = await User.countDocuments({ role: 'EMPLOYEE' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $in: ['Order Created', 'Design Approved', 'Raw Material Procured', 'PENDING', 'Draft', 'DRAFT'] } });
    const inProduction = await Order.countDocuments({ status: { $in: ['Production Started', 'Cutting Completed', 'Stitching Completed', 'Quality Check', 'IN_PRODUCTION'] } });
    const readyForDispatch = await Order.countDocuments({ status: { $in: ['Packing', 'Ready For Dispatch', 'Dispatched'] } });
    const completedOrders = await Order.countDocuments({ status: { $in: ['Delivered', 'COMPLETED', 'DELIVERED'] } });

    // Chart Aggregations
    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$orderDate" },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalValue" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueData = monthlyOrders.map(m => ({ name: monthNames[m._id - 1], revenue: m.revenue || 0 }));
    const ordersPerMonthData = monthlyOrders.map(m => ({ name: monthNames[m._id - 1], orders: m.orders || 0 }));

    const orderStatusDistribution = await Order.aggregate([
      { $group: { _id: "$status", value: { $sum: 1 } } }
    ]);
    const orderStatusData = orderStatusDistribution.map(s => ({ name: s._id, value: s.value }));

    res.json({
      totalManagers,
      totalEmployees,
      totalOrders,
      pendingOrders,
      inProduction,
      readyForDispatch,
      completedOrders,
      revenueData,
      ordersPerMonthData,
      orderStatusData,
      attendanceTrendsData: [],
      managerPerformanceData: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// 2. Manager Management
const createManager = async (req, res) => {
  try {
    const { name, email, password, pin } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const manager = await User.create({
      name,
      email,
      password,
      pin,
      role: 'MANAGER',
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Manager created', manager: { _id: manager._id, name: manager.name, email: manager.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error creating manager', error: error.message });
  }
};

const updateManager = async (req, res) => {
  try {
    const { name, email } = req.body;
    const manager = await User.findById(req.params.id);

    if (!manager || manager.role !== 'MANAGER') {
      return res.status(404).json({ message: 'Manager not found' });
    }

    manager.name = name || manager.name;
    manager.email = email || manager.email;

    const updatedManager = await manager.save();
    res.json({ message: 'Manager updated', manager: { _id: updatedManager._id, name: updatedManager.name, email: updatedManager.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating manager', error: error.message });
  }
};

const toggleManagerStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'ACTIVE' or 'INACTIVE'
    const manager = await User.findById(req.params.id);

    if (!manager || manager.role !== 'MANAGER') {
      return res.status(404).json({ message: 'Manager not found' });
    }

    manager.status = status;
    await manager.save();
    res.json({ message: `Manager marked as ${status}`, status: manager.status });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

const deleteManager = async (req, res) => {
  try {
    const manager = await User.findById(req.params.id);

    if (!manager || manager.role !== 'MANAGER') {
      return res.status(404).json({ message: 'Manager not found' });
    }

    await manager.deleteOne();
    res.json({ message: 'Manager removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting manager', error: error.message });
  }
};

const sendManagerCredentials = async (req, res) => {
  try {
    const manager = await User.findById(req.params.id);

    if (!manager || manager.role !== 'MANAGER') {
      return res.status(404).json({ message: 'Manager not found' });
    }

    await sendEmail({
      email: manager.email,
      subject: 'Your Manager Login Credentials - Vishnu Creations ERP',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px; color: #0f172a; border: 1px solid #e2e8f0;">
          <h2 style="text-align: center; color: #0f172a; margin-bottom: 8px; font-size: 22px;">Welcome to Vishnu Creations ERP</h2>
          <p style="text-align: center; color: #475569; font-size: 14px; margin-bottom: 28px;">Hello <strong>${manager.name}</strong>, here are your Manager login details:</p>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0;"><strong>Role:</strong> Manager</p>
            <p style="margin: 0 0 12px 0;"><strong>Email:</strong> ${manager.email}</p>
            <p style="margin: 0 0 12px 0;"><strong>Password:</strong> ${manager.password}</p>
          </div>
          <p style="text-align: center; color: #64748b; font-size: 12px;">Please keep these credentials safe and do not share them.</p>
        </div>
      `,
    });

    res.json({ message: 'Credentials sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending credentials', error: error.message });
  }
};

const getManagers = async (req, res) => {
  try {
    const { skip, limit, sort, page } = getPaginationOptions(req);
    const search = req.query.search;
    
    let query = { role: 'MANAGER' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    const managers = await User.find(query)
      .select('-password -pin')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      managers,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching managers', error: error.message });
  }
};

// 3. View Orders
const getOrders = async (req, res) => {
  try {
    const { skip, limit, sort, page } = getPaginationOptions(req);
    const search = req.query.search;
    
    let query = {};
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;

    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// 4. View Attendance
const getAttendance = async (req, res) => {
  try {
    const { skip, limit, sort, page } = getPaginationOptions(req);
    
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.date) {
      const startOfDay = new Date(req.query.date);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(req.query.date);
      endOfDay.setHours(23,59,59,999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // For simplicity, search inside attendance is usually filtered by exact dates or status
    // To search by User Name we could lookup, but we'll stick to basic filters.

    const attendance = await Attendance.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('employeeId', 'name email role');

    const total = await Attendance.countDocuments(query);

    res.json({
      attendance,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

// 5. Employee Management
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, pin } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const employee = await User.create({
      name,
      email,
      password,
      pin,
      role: 'EMPLOYEE',
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Employee created', employee: { _id: employee._id, name: employee.name, email: employee.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error creating employee', error: error.message });
  }
};

const sendEmail = require('../utils/mailer');

const getEmployees = async (req, res) => {
  try {
    const { skip, limit, sort, page } = getPaginationOptions(req);
    const search = req.query.search;
    
    let query = { role: 'EMPLOYEE' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    const employees = await User.find(query)
      .select('-password -pin')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      employees,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
};

const toggleEmployeeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const employee = await User.findById(req.params.id);

    if (!employee || employee.role !== 'EMPLOYEE') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.status = status;
    await employee.save();
    res.json({ message: `Employee marked as ${status}`, status: employee.status });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee || employee.role !== 'EMPLOYEE') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.deleteOne();
    res.json({ message: 'Employee removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
};

const sendEmployeeCredentials = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee || employee.role !== 'EMPLOYEE') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await sendEmail({
      email: employee.email,
      subject: 'Your Login Credentials - Vishnu Creations ERP',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px; color: #0f172a; border: 1px solid #e2e8f0;">
          <h2 style="text-align: center; color: #0f172a; margin-bottom: 8px; font-size: 22px;">Welcome to Vishnu Creations ERP</h2>
          <p style="text-align: center; color: #475569; font-size: 14px; margin-bottom: 28px;">Hello <strong>${employee.name}</strong>, here are your login details:</p>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0;"><strong>Role:</strong> Employee</p>
            <p style="margin: 0 0 12px 0;"><strong>Email:</strong> ${employee.email}</p>
            <p style="margin: 0 0 12px 0;"><strong>Password:</strong> ${employee.password}</p>
            ${employee.pin ? `<p style="margin: 0;"><strong>Attendance PIN:</strong> ${employee.pin}</p>` : ''}
          </div>
          <p style="text-align: center; color: #64748b; font-size: 12px;">Please keep these credentials safe and do not share them.</p>
        </div>
      `,
    });

    res.json({ message: 'Credentials sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending credentials', error: error.message });
  }
};

const getEmailLogs = async (req, res) => {
  try {
    const { skip, limit, sort, page } = getPaginationOptions(req);
    const search = req.query.search;
    
    let query = {};
    if (search) {
      query.$or = [
        { recipientEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (req.query.status) query.status = req.query.status;

    const logs = await EmailLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await EmailLog.countDocuments(query);

    res.json({
      logs,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching email logs', error: error.message });
  }
};

const retryEmail = async (req, res) => {
  try {
    const log = await retrySingleEmail(req.params.id);
    res.json({ message: 'Email retried successfully', log });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retry email', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  createManager,
  updateManager,
  toggleManagerStatus,
  deleteManager,
  getManagers,
  getOrders,
  getAttendance,
  createEmployee,
  getEmployees,
  toggleEmployeeStatus,
  deleteEmployee,
  sendEmployeeCredentials,
  getEmailLogs,
  retryEmail,
  sendManagerCredentials
};
