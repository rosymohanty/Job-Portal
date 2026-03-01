// middleware/rateLimiterMiddleware.js
const rateLimit = require('express-rate-limit');

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      success: false,
      message: "Too many requests, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use the built-in IP handling
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

// Pre-configured rate limiters
const adminRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const authRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts, please try again after an hour."
  }
});

const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60
});

// Export everything
module.exports = {
  createRateLimiter,
  adminRateLimiter,
  authRateLimiter,
  apiRateLimiter
};