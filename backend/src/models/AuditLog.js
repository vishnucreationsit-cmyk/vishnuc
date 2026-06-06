const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Indexed for fast queries by user
  },
  action: {
    type: String,
    required: true,
    index: true // Indexed for filtering (e.g., CREATE_ORDER, UPDATE_EMPLOYEE)
  },
  resource: {
    type: String, // e.g., 'ORDER', 'USER', 'ATTENDANCE'
    required: true,
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed // Stores previous vs new state or payload
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    default: 'SUCCESS'
  }
}, { timestamps: true });

// Compound index for querying logs by resource and time (common in enterprise)
auditLogSchema.index({ resource: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
