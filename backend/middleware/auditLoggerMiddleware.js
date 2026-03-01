// middleware/auditLoggerMiddleware.js
// Note: You'll need to create the AuditLog model first

/**
 * Audit logger middleware to track all admin actions
 */
const auditLogger = async (req, res, next) => {
  // Store the original send function
  const originalSend = res.send;
  
  // Capture response data
  let responseBody;
  res.send = function(body) {
    responseBody = body;
    originalSend.call(this, body);
  };

  // Store start time
  const startTime = Date.now();

  // Log after response is sent
  res.on('finish', async () => {
    try {
      // Don't log GET requests to audit logs (too noisy)
      if (req.method === 'GET') return;

      // You can implement AuditLog model later
      console.log(`[AUDIT] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${Date.now() - startTime}ms`);
      
      // When you create the AuditLog model, you can uncomment this:
      /*
      const AuditLog = require('../models/AuditLog');
      
      // Sanitize sensitive data
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) delete sanitizedBody.password;
      if (sanitizedBody.oldPassword) delete sanitizedBody.oldPassword;
      if (sanitizedBody.newPassword) delete sanitizedBody.newPassword;

      const log = new AuditLog({
        admin: req.user?._id,
        action: `${req.method} ${req.originalUrl}`,
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query,
        body: req.method !== 'GET' ? sanitizedBody : undefined,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        statusCode: res.statusCode,
        response: responseBody,
        responseTime: Date.now() - startTime,
        timestamp: new Date()
      });

      await log.save();
      */
    } catch (error) {
      console.error('Audit log error:', error);
    }
  });

  next();
};

module.exports = { auditLogger };