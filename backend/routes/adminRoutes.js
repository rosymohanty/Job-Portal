// adminRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { validateObjectId, validateQueryParams } = require("../middleware/validationMiddleware");
const { adminRateLimiter } = require("../middleware/rateLimiterMiddleware");
const { auditLogger } = require("../middleware/auditLoggerMiddleware");
const { validateUserUpdate } = require("../middleware/userValidationMiddleware");
const { 
  getAllUsers,
  getUserStats,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserApproval,
  getAllJobs,
  deleteJob,
  getAdminDashboardStats,
  bulkApproveEmployers,
  bulkDeleteUsers,
  getAdminAuditLogs,
  exportUsersData,
  exportJobsData
} = require("../controllers/adminController");

// All admin routes are protected
router.use(protect);
router.use(authorizeRoles("admin"));
router.use(adminRateLimiter); // Using the exported rate limiter
router.use(auditLogger); // Log all admin actions

// ==================== User Management Routes ====================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filters
 * @access  Admin
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 * @query   {string} role - Filter by role (user/employer/admin)
 * @query   {string} search - Search by name or email
 * @query   {string} sortBy - Sort field (createdAt/name/email)
 * @query   {string} order - Sort order (asc/desc)
 */
router.get("/users", validateQueryParams, getAllUsers);

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics
 * @access  Admin
 */
router.get("/users/stats", getUserStats);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user by ID
 * @access  Admin
 */
router.get("/users/:id", validateObjectId("id"), getUserById);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user (admin only)
 * @access  Admin
 * @body    {string} name - User's full name
 * @body    {string} email - User's email
 * @body    {string} phone - User's phone number
 * @body    {string} companyName - Company name (for employers)
 * @body    {string} bio - User bio
 * @body    {array} skills - Skills array (for job seekers)
 * @body    {string} location - Location
 * @body    {boolean} isApproved - Approval status (for employers)
 */
router.put(
  "/users/:id", 
  validateObjectId("id"),
  validateUserUpdate,
  updateUser
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Admin
 */
router.delete(
  "/users/:id", 
  validateObjectId("id"),
  deleteUser
);

/**
 * @route   PATCH /api/admin/users/:id/toggle-approval
 * @desc    Toggle employer approval status
 * @access  Admin
 */
router.patch(
  "/users/:id/toggle-approval",
  validateObjectId("id"),
  toggleUserApproval
);

/**
 * @route   POST /api/admin/users/bulk-approve
 * @desc    Bulk approve employers
 * @access  Admin
 * @body    {string[]} userIds - Array of user IDs to approve
 */
router.post("/users/bulk-approve", bulkApproveEmployers);

/**
 * @route   POST /api/admin/users/bulk-delete
 * @desc    Bulk delete users
 * @access  Admin
 * @body    {string[]} userIds - Array of user IDs to delete
 */
router.post("/users/bulk-delete", bulkDeleteUsers);

/**
 * @route   GET /api/admin/users/export
 * @desc    Export users data (CSV/Excel)
 * @access  Admin
 * @query   {string} format - Export format (csv/excel) - default: csv
 * @query   {string} role - Filter by role before export
 */
router.get("/users/export", exportUsersData);

// ==================== Job Management Routes ====================

/**
 * @route   GET /api/admin/jobs
 * @desc    Get all jobs with filters
 * @access  Admin
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 * @query   {string} status - Filter by status (active/inactive)
 * @query   {string} employerId - Filter by employer
 * @query   {string} jobType - Filter by job type
 * @query   {string} search - Search by title or description
 */
router.get("/jobs", validateQueryParams, getAllJobs);

/**
 * @route   DELETE /api/admin/jobs/:id
 * @desc    Delete job
 * @access  Admin
 */
router.delete(
  "/jobs/:id", 
  validateObjectId("id"),
  deleteJob
);

/**
 * @route   GET /api/admin/jobs/export
 * @desc    Export jobs data (CSV/Excel)
 * @access  Admin
 * @query   {string} format - Export format (csv/excel) - default: csv
 * @query   {string} status - Filter by status before export
 */
router.get("/jobs/export", exportJobsData);

// ==================== Dashboard Routes ====================

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get admin dashboard statistics
 * @access  Admin
 */
router.get("/dashboard/stats", getAdminDashboardStats);

// ==================== System Routes ====================

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get admin audit logs
 * @access  Admin (Super Admin only)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 20)
 * @query   {string} adminId - Filter by admin ID
 * @query   {string} action - Filter by action type
 * @query   {string} startDate - Filter by start date
 * @query   {string} endDate - Filter by end date
 */
router.get("/audit-logs", validateQueryParams, getAdminAuditLogs);

// ==================== Health Check ====================

/**
 * @route   GET /api/admin/health
 * @desc    Health check endpoint
 * @access  Admin
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin API is running",
    timestamp: new Date().toISOString(),
    admin: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;