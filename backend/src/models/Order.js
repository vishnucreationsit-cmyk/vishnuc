const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalValue: {
    type: Number,
    required: true,
    min: 0
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
    index: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING', 'IN_PRODUCTION', 'COMPLETED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  creatorRole: {
    type: String,
    enum: ['ADMIN', 'MANAGER'],
    required: true
  }
}, { timestamps: true });

// Compound indexes for optimal dashboard and reporting performance
orderSchema.index({ status: 1, dueDate: 1 });
orderSchema.index({ company: 1, status: 1 });
orderSchema.index({ createdBy: 1, orderDate: -1 });

// Pre-validate hook to calculate total value automatically before required checks
orderSchema.pre('validate', function() {
  if (this.quantity && this.unitPrice && !this.totalValue) {
    this.totalValue = this.quantity * this.unitPrice;
  }
});

module.exports = mongoose.model('Order', orderSchema);
