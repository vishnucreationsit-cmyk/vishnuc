const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    default: 'EMPLOYEE',
    index: true
  },
  pin: {
    type: String,
    // Hashed securely if used for quick login/attendance
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Removed pre-save hook for hashing

// Method to check password (Plaintext comparison)
userSchema.methods.matchPassword = async function(enteredPassword) {
  return enteredPassword === this.password;
};

// Method to check pin (Plaintext comparison)
userSchema.methods.matchPin = async function(enteredPin) {
  if (!this.pin) return false;
  return enteredPin === this.pin;
};

module.exports = mongoose.model('User', userSchema);
