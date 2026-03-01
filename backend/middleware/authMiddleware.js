const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect middleware - verifies JWT token and attaches user to request
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Optional: Check for token in cookies (if using cookies)
    // else if (req.cookies && req.cookies.token) {
    //   token = req.cookies.token;
    // }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        message: "Token expired, please login again",
      });
    }

    // Find user and attach to request
    const user = await User.findById(decoded.id)
      .select("-password")
      .lean(); // Use lean() for better performance if you don't need mongoose documents

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found, please login again",
      });
    }

    // Optional: Check if user account is active/approved
    if (user.isApproved === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token, please login again",
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired, please login again",
      });
    }

    // Log unexpected errors for debugging
    console.error("Auth middleware error:", error);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, please login first",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

// Specific role checkers for convenience
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, please login first",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

const isEmployer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, please login first",
    });
  }

  if (req.user.role !== "employer") {
    return res.status(403).json({
      success: false,
      message: "Employer access required",
    });
  }

  next();
};

// Check if user owns the resource or is admin
const isOwnerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, please login first",
      });
    }

    if (req.user.role === "admin" || req.user._id.toString() === resourceUserId.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "You don't have permission to perform this action",
    });
  };
};

// Optional: Generate new token middleware (for token refresh)
const generateToken = (req, res, next) => {
  if (req.user) {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "30d" }
    );
    req.token = token;
  }
  next();
};

module.exports = { 
  protect, 
  authorizeRoles,
  isAdmin,
  isEmployer,
  isOwnerOrAdmin,
  generateToken 
};