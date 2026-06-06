const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// Middleware to track system activity globally
const auditActivity = (resourceName) => {
  return async (req, res, next) => {
    // We only want to log mutations, not reads, to save DB space
    if (req.method === 'GET') return next();

    // Store the original send function to intercept the response
    const originalSend = res.send;
    
    res.send = function (body) {
      res.send = originalSend;
      res.send(body); // Send the response to the client immediately

      // Asynchronously process the audit log so it doesn't block the request
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        let action = 'UNKNOWN';
        switch (req.method) {
          case 'POST': action = `CREATE_${resourceName}`; break;
          case 'PUT': 
          case 'PATCH': action = `UPDATE_${resourceName}`; break;
          case 'DELETE': action = `DELETE_${resourceName}`; break;
        }

        try {
          // Parse body if it's stringified JSON
          let parsedBody = body;
          try { parsedBody = JSON.parse(body); } catch (e) {}

          const logEntry = new AuditLog({
            user: req.user._id,
            action: action,
            resource: resourceName,
            resourceId: req.params.id || (parsedBody.order ? parsedBody.order._id : null) || (parsedBody.employee ? parsedBody.employee._id : null),
            details: {
              payload: req.body,
              query: req.query
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
          });

          logEntry.save().catch(err => logger.error(`Audit log save failed: ${err.message}`));
        } catch (error) {
          logger.error(`Failed to construct audit log: ${error.message}`);
        }
      }
    };

    next();
  };
};

module.exports = { auditActivity };
