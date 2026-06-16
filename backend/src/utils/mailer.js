const nodemailer = require('nodemailer');
const logger = require('./logger');
const EmailLog = require('../models/EmailLog');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  // Validate recipient email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(options.email)) {
    throw new Error(`Invalid recipient email address: ${options.email}`);
  }

  // Create EmailLog entry
  const emailLog = new EmailLog({
    recipientEmail: options.email,
    subject: options.subject,
    htmlContent: options.html || `<p>${options.message}</p>`,
    status: 'PENDING',
  });
  await emailLog.save();

  try {
    const mailOptions = {
      from: `"Vishnu Creations ERP" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: emailLog.htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Update log on success
    emailLog.status = 'SENT';
    emailLog.smtpResponse = info.response;
    await emailLog.save();
    
    logger.info(`Email successfully sent via Nodemailer to ${options.email} - MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    // Update log on failure
    emailLog.status = 'FAILED';
    emailLog.errorMessage = error.message;
    await emailLog.save();
    
    logger.error(`Email delivery failed to ${options.email}: ${error.message}`);
    // Throw error so the caller knows EXACTLY why it failed and doesn't show "Success"
    throw error;
  }
};

module.exports = sendEmail;
