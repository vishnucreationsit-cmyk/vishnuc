const User = require('../models/User');
const Order = require('../models/Order');
const Attendance = require('../models/Attendance');

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
    const pendingOrders = await Order.countDocuments({ status: 'PENDING' });
    const completedOrders = await Order.countDocuments({ status: 'COMPLETED' });

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

module.exports = {
  getDashboardStats,
  createManager,
  updateManager,
  toggleManagerStatus,
  deleteManager,
  getManagers,
  getOrders,
  getAttendance
};
