const { Resend } = require('resend');
const logger = require('./logger');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const data = await resend.emails.send({
      from: 'Vishnu Creations ERP <onboarding@resend.dev>', // Update this to a verified domain if you have one, e.g., 'noreply@vishnucreations.com'
      to: options.email,
      subject: options.subject,
      html: options.html || `<p>${options.message}</p>`,
    });

    if (data.error) {
      logger.error(`Resend Email API Error to ${options.email}: ${data.error.message}`);
      return false;
    }

    logger.info(`Email successfully sent via Resend to ${options.email} - ID: ${data.data.id}`);
    return true;
  } catch (error) {
    logger.error(`Email delivery failed to ${options.email}: ${error.message}`);
    return false;
  }
};

module.exports = sendEmail;
