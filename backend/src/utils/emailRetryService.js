const EmailLog = require('../models/EmailLog');
const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const retryFailedEmails = async () => {
  try {
    // Find failed emails with less than 3 retries
    const failedEmails = await EmailLog.find({
      status: 'FAILED',
      retryCount: { $lt: 3 },
    });

    if (failedEmails.length === 0) return;

    logger.info(`Found ${failedEmails.length} failed emails to retry.`);

    for (const log of failedEmails) {
      try {
        const mailOptions = {
          from: `"Vishnu Creations ERP" <${process.env.EMAIL_USER}>`,
          to: log.recipientEmail,
          subject: log.subject,
          html: log.htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        
        log.status = 'SENT';
        log.smtpResponse = info.response;
        log.errorMessage = '';
        log.retryCount += 1;
        await log.save();
        
        logger.info(`Successfully retried email to ${log.recipientEmail}`);
      } catch (error) {
        log.retryCount += 1;
        log.errorMessage = error.message;
        await log.save();
        logger.error(`Retry failed for email to ${log.recipientEmail}: ${error.message}`);
      }
    }
  } catch (error) {
    logger.error(`Error in email retry service: ${error.message}`);
  }
};

const retrySingleEmail = async (id) => {
  const log = await EmailLog.findById(id);
  if (!log) throw new Error('Email log not found');

  try {
    const mailOptions = {
      from: `"Vishnu Creations ERP" <${process.env.EMAIL_USER}>`,
      to: log.recipientEmail,
      subject: log.subject,
      html: log.htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    log.status = 'SENT';
    log.smtpResponse = info.response;
    log.errorMessage = '';
    log.retryCount += 1;
    await log.save();
    return log;
  } catch (error) {
    log.retryCount += 1;
    log.errorMessage = error.message;
    await log.save();
    throw error;
  }
};

const startEmailRetryService = () => {
  // Run every 5 minutes
  const INTERVAL_MS = 5 * 60 * 1000;
  setInterval(retryFailedEmails, INTERVAL_MS);
  logger.info('Email retry service started (runs every 5 minutes).');
};

module.exports = { startEmailRetryService, retryFailedEmails, retrySingleEmail };
