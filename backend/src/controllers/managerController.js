const User = require('../models/User');
const Order = require('../models/Order');
const Attendance = require('../models/Attendance');

// Helper for Pagination
const getPaginationOptions = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || '-createdAt';
  return { page, limit, skip, sort };
};

// =======================
// DASHBOARD STATS
// =======================

const getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'EMPLOYEE', createdBy: req.user._id });
    const activeOrders = await Order.countDocuments({ status: { $in: ['IN_PRODUCTION', 'PENDING'] }, createdBy: req.user._id });
    const pendingOrders = await Order.countDocuments({ status: 'PENDING', createdBy: req.user._id });
    const completedOrders = await Order.countDocuments({ status: 'COMPLETED', createdBy: req.user._id });

    // Chart Aggregations
    const monthlyOrders = await Order.aggregate([
      { $match: { createdBy: req.user._id } },
      {
        $group: {
          _id: { $month: "$orderDate" },
          production: { $sum: "$quantity" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyProductionData = monthlyOrders.map(m => ({ name: monthNames[m._id - 1], production: m.production || 0 }));

    res.json({
      stats: {
        totalEmployees,
        activeOrders,
        pendingOrders,
        completedOrders
      },
      monthlyProductionData,
      employeeAttendanceData: [], // Placeholder for now
      myOrdersData: [] // Placeholder for now
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// =======================
// EMPLOYEE MANAGEMENT
// =======================

const createEmployee = async (req, res) => {
  try {
    const { name, email, password, pin } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const employee = await User.create({
      name,
      email,
      password,
      pin,
      role: 'EMPLOYEE',
      createdBy: req.user._id, // Store manager id
    });

    res.status(201).json({ message: 'Employee created', employee: { _id: employee._id, name: employee.name, email: employee.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error creating employee', error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { name, email, pin } = req.body;
    const employee = await User.findById(req.params.id);

    if (!employee || employee.role !== 'EMPLOYEE') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.name = name || employee.name;
    employee.email = email || employee.email;
    if (pin) employee.pin = pin;

    const updatedEmployee = await employee.save();
    res.json({ message: 'Employee updated', employee: { _id: updatedEmployee._id, name: updatedEmployee.name, email: updatedEmployee.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee', error: error.message });
  }
};

const toggleEmployeeStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'ACTIVE' or 'INACTIVE'
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
    
    if (req.query.status) query.status = req.query.status;

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

// =======================
// ORDER MANAGEMENT
// =======================

const createOrder = async (req, res) => {
  try {
    const { quantity, unitPrice, totalValue } = req.body;
    
    // Explicitly calculate totalValue if not provided by the frontend
    const finalTotalValue = totalValue !== undefined 
      ? totalValue 
      : (Number(quantity) || 0) * (Number(unitPrice) || 0);

    const orderData = {
      ...req.body,
      totalValue: finalTotalValue,
      createdBy: req.user._id,
      creatorRole: req.user.role
    };
    
    const order = await Order.create(orderData);
    res.status(201).json({ message: 'Order created', order });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Allow updates to specific fields
    const fieldsToUpdate = ['company', 'contactPerson', 'mobileNumber', 'productName', 'category', 'quantity', 'unitPrice', 'totalValue', 'dueDate', 'priority', 'description'];
    
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        order[field] = req.body[field];
      }
    });

    const updatedOrder = await order.save();
    res.json({ message: 'Order updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    const updatedOrder = await order.save();
    res.json({ message: 'Order status updated', status: updatedOrder.status });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

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

    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    const total = await Order.countDocuments(query);

    res.json({ orders, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// =======================
// ATTENDANCE MANAGEMENT
// =======================

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

    const attendance = await Attendance.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('employeeId', 'name email role');

    const total = await Attendance.countDocuments(query);

    res.json({ attendance, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  getEmployees,
  createOrder,
  updateOrder,
  updateOrderStatus,
  getOrders,
  getAttendance
};
