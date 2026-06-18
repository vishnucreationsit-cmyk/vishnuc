require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Order = require('./src/models/Order');

const seedCustomerOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    let admin = await User.findOne({ email: 'cheshwar4400@gmail.com' });
    if (!admin) {
      console.log('Admin user not found. Cannot create orders.');
      process.exit(1);
    }

    const ordersData = [
      {
        company: 'Premium Leather Goods Inc',
        contactPerson: 'John Smith',
        mobileNumber: '9876543210',
        productName: 'Classic Leather Duffel Bag',
        category: 'Travel Bags',
        quantity: 50,
        unitPrice: 2500,
        dueDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        priority: 'HIGH',
        status: 'Order Created',
        createdBy: admin._id,
        creatorRole: admin.role,
        description: 'Large premium leather duffel bags as seen in catalog.'
      },
      {
        company: 'Urban Styles Boutique',
        contactPerson: 'Sarah Johnson',
        mobileNumber: '8765432109',
        productName: 'Vintage Leather Backpack',
        category: 'Backpacks',
        quantity: 30,
        unitPrice: 1800,
        dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'MEDIUM',
        status: 'Order Created',
        createdBy: admin._id,
        creatorRole: admin.role,
        description: 'Leather backpacks with multiple compartments.'
      },
      {
        company: 'Elegant Accessories',
        contactPerson: 'Michael Brown',
        mobileNumber: '7654321098',
        productName: 'Leather Tote Bag',
        category: 'Handbags',
        quantity: 100,
        unitPrice: 1200,
        dueDate: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        priority: 'MEDIUM',
        status: 'Order Created',
        createdBy: admin._id,
        creatorRole: admin.role,
        description: 'Standard size women\'s leather tote bags.'
      },
      {
        company: 'Travel Essentials Ltd',
        contactPerson: 'Emily Davis',
        mobileNumber: '6543210987',
        productName: 'Leather Toiletry Pouch',
        category: 'Accessories',
        quantity: 200,
        unitPrice: 400,
        dueDate: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        priority: 'LOW',
        status: 'Order Created',
        createdBy: admin._id,
        creatorRole: admin.role,
        description: 'Small leather pouches for toiletries and cosmetics.'
      }
    ];

    for (let orderData of ordersData) {
      await Order.create(orderData);
      console.log(`Order created for ${orderData.productName}`);
    }

    console.log('Customer orders seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating orders:', error);
    process.exit(1);
  }
};

seedCustomerOrders();
