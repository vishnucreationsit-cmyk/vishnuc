const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date
  },
  durationWorked: {
    type: Number, // Stored in minutes
    default: 0
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    distanceFromOffice: {
      type: Number
    },
    address: {
      type: String
    }
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'],
    default: 'PRESENT',
    index: true
  }
}, { timestamps: true });

// Compound index for querying specific employee's attendance on a specific date. 
// The unique constraint ensures an employee only has one primary attendance record per day.
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
// Index for generating daily attendance reports across all employees quickly
attendanceSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
