// middleware/validationMiddleware.js
const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId parameter
 * @param {string} paramName - Name of the parameter to validate
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: `${paramName} is required`
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format: must be a valid MongoDB ObjectId`
      });
    }
    
    next();
  };
};

/**
 * Validate query parameters for pagination and filtering
 */
const validateQueryParams = (req, res, next) => {
  const { page, limit, sortBy, order, startDate, endDate } = req.query;
  
  // Validate page
  if (page) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive number"
      });
    }
    req.query.page = pageNum;
  }
  
  // Validate limit
  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100"
      });
    }
    req.query.limit = limitNum;
  }
  
  // Validate sort order
  if (order && !['asc', 'desc'].includes(order.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: "Order must be either 'asc' or 'desc'"
    });
  }
  
  // Validate dates
  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({
      success: false,
      message: "Invalid startDate format"
    });
  }
  
  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({
      success: false,
      message: "Invalid endDate format"
    });
  }
  
  next();
};

module.exports = {
  validateObjectId,
  validateQueryParams
};