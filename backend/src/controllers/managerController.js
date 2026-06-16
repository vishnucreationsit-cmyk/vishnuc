const User = require('../models/User');
const Order = require('../models/Order');
const Attendance = require('../models/Attendance');
const sendEmail = require('../utils/mailer');

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
    const totalOrders = await Order.countDocuments({ createdBy: req.user._id });
    const inProgressOrders = await Order.countDocuments({ status: { $in: ['Order Created', 'Design Approved', 'Raw Material Procured', 'Production Started', 'Cutting Completed', 'Stitching Completed', 'Quality Check', 'Packing', 'Ready For Dispatch', 'Dispatched'] }, createdBy: req.user._id });
    const deliveredOrders = await Order.countDocuments({ status: { $in: ['Delivered', 'COMPLETED', 'DELIVERED'] }, createdBy: req.user._id });

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
        totalOrders,
        inProgressOrders,
        deliveredOrders
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

const sendEmployeeCredentials = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee || employee.role !== 'EMPLOYEE') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Managers can only send credentials to employees they created or manage
    if (employee.createdBy && employee.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to send credentials to this employee' });
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

    // Send Notification Email (async, don't await so it doesn't block)
    sendEmail({
      email: req.user.email,
      subject: `New Order Created: ${order.productName} (${order.company})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Order Successfully Created</h2>
          <p>Order for <strong>${order.productName}</strong> has been created with status: ${order.status}</p>
        </div>
      `
    }).catch(err => console.error("Email failed", err));

    res.status(201).json({ message: 'Order created', order });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const fieldsToUpdate = ['company', 'contactPerson', 'mobileNumber', 'productName', 'category', 'quantity', 'unitPrice', 'totalValue', 'dueDate', 'priority', 'description', 'images'];
    
    const changedFields = {};
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        const isDifferent = field === 'images' 
          ? JSON.stringify(req.body[field]) !== JSON.stringify(order[field])
          : String(req.body[field]) !== String(order[field]);
          
        if (isDifferent) {
          changedFields[field] = { old: order[field], new: req.body[field] };
          order[field] = req.body[field];
        }
      }
    });

    if (Object.keys(changedFields).length > 0) {
      order.auditLogs.push({
        action: 'EDIT',
        changedFields,
        updatedBy: req.user._id,
        notes: req.body.editNotes || 'Updated order details'
      });
    }

    const updatedOrder = await order.save();
    res.json({ message: 'Order updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

const WORKFLOW_STAGES = [
  'Order Created', 'Design Approved', 'Raw Material Procured', 
  'Production Started', 'Cutting Completed', 'Stitching Completed', 
  'Quality Check', 'Packing', 'Ready For Dispatch', 'Dispatched', 'Delivered'
];

const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const currentIndex = WORKFLOW_STAGES.indexOf(order.status);
    const newIndex = WORKFLOW_STAGES.indexOf(status);

    if (currentIndex !== -1 && newIndex !== -1 && status !== 'Cancelled') {
      if (newIndex > currentIndex + 1) {
        return res.status(400).json({ 
          message: `Cannot skip stages. Next required stage is: ${WORKFLOW_STAGES[currentIndex + 1]}` 
        });
      }
    }

    const previousStatus = order.status;
    order.status = status;

    order.statusHistory.push({
      previousStatus,
      newStatus: status,
      updatedBy: req.user._id,
      notes: notes || ''
    });

    const updatedOrder = await order.save();

    // Send Notification Email
    sendEmail({
      email: req.user.email,
      subject: `Order Status Update: ${order.productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Order Status Changed</h2>
          <p>The order for <strong>${order.productName}</strong> has moved from <strong>${previousStatus}</strong> to <strong style="color: blue;">${status}</strong>.</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>
      `
    }).catch(err => console.error("Email failed", err));

    res.json({ message: 'Order status updated', status: updatedOrder.status, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

const deliverOrder = async (req, res) => {
  try {
    const { date, deliveredTo, receiverName, receiverMobile, notes, proofImage } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.deliveryDetails = { date, deliveredTo, receiverName, receiverMobile, notes, proofImage };
    
    const previousStatus = order.status;
    order.status = 'Delivered';

    order.statusHistory.push({
      previousStatus,
      newStatus: 'Delivered',
      updatedBy: req.user._id,
      notes: 'Order delivered to customer'
    });

    const updatedOrder = await order.save();

    // Send Notification Email
    sendEmail({
      email: req.user.email,
      subject: `Order Delivered: ${order.productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Order Delivered Successfully</h2>
          <p>The order for <strong>${order.productName}</strong> was delivered to <strong>${receiverName}</strong>.</p>
          <p><strong>Mobile:</strong> ${receiverMobile}</p>
        </div>
      `
    }).catch(err => console.error("Email failed", err));

    res.json({ message: 'Order marked as delivered', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error delivering order', error: error.message });
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

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('statusHistory.updatedBy', 'name email')
      .populate('auditLogs.updatedBy', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order details', error: error.message });
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
  deliverOrder,
  getOrders,
  getOrderById,
  getAttendance,
  sendEmployeeCredentials
};
