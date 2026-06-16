const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
    },
    htmlContent: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED'],
      default: 'PENDING',
    },
    errorMessage: {
      type: String,
    },
    smtpResponse: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const EmailLog = mongoose.model('EmailLog', emailLogSchema);
module.exports = EmailLog;
