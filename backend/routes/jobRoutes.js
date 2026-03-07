// jobRoutes.js
const express = require("express");
const router = express.Router();

const {
  postJob,
  getAllJobs,
  getSingleJob,
  applyForJob,
  viewAppliedJobs,
  updateJob,
  deleteJob,
  getMyPostedJobs,
  viewApplicants,
  changeApplicationStatus,
  employerDashboardStats,
  saveJob,
  getSavedJobs,
  checkApplicationStatus,
  getSimilarJobs,
  getJobStats,
  toggleJobStatus  // Added for admin use
} = require("../controllers/jobController");

const { protect, authorizeRoles, optionalAuth } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");
const { apiRateLimiter } = require("../middleware/rateLimiterMiddleware");

// Apply rate limiting to all job routes
router.use(apiRateLimiter);

// ================= PUBLIC ROUTES =================
/**
 * @route   GET /api/jobs
 * @desc    Get all jobs with filtering and pagination
 * @access  Public (enhanced for logged-in users)
 * @query   {string} keyword - Search by keyword
 * @query   {string} location - Filter by location
 * @query   {string} jobType - Filter by job type
 * @query   {number} minSalary - Minimum salary
 * @query   {number} maxSalary - Maximum salary
 * @query   {string} experienceLevel - Filter by experience level
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 */
router.get("/", optionalAuth, getAllJobs);

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job by ID
 * @access  Public (enhanced for logged-in users)
 */
router.get("/:id", optionalAuth, validateObjectId("id"), getSingleJob);

/**
 * @route   GET /api/jobs/:id/similar
 * @desc    Get similar jobs
 * @access  Public
 */
router.get("/:id/similar", validateObjectId("id"), getSimilarJobs);

// ================= USER ROUTES =================
/**
 * @route   GET /api/jobs/applied/me
 * @desc    Get jobs applied by current user
 * @access  Private (User only)
 */
router.get("/applied/me", protect, authorizeRoles("user"), viewAppliedJobs);

/**
 * @route   GET /api/jobs/:id/application-status
 * @desc    Check if user has applied to a job
 * @access  Private (User only)
 */
router.get("/:id/application-status", protect, authorizeRoles("user"), validateObjectId("id"), checkApplicationStatus);

/**
 * @route   POST /api/jobs/:id/apply
 * @desc    Apply for a job
 * @access  Private (User only)
 * @body    {string} [coverLetter] - Optional cover letter
 */
router.post("/:id/apply", protect, authorizeRoles("user"), validateObjectId("id"), applyForJob);

/**
 * @route   POST /api/jobs/:id/save
 * @desc    Save or unsave a job
 * @access  Private (User only)
 */
router.post("/:id/save", protect, authorizeRoles("user"), validateObjectId("id"), saveJob);

/**
 * @route   GET /api/jobs/saved
 * @desc    Get saved jobs for current user
 * @access  Private (User only)
 */
router.get("/saved", protect, authorizeRoles("user"), getSavedJobs);

// ================= EMPLOYER ROUTES =================
/**
 * @route   GET /api/jobs/employer/dashboard
 * @desc    Get employer dashboard statistics
 * @access  Private (Employer only)
 */
router.get("/employer/stats", protect, authorizeRoles("employer"), employerDashboardStats);

/**
 * @route   GET /api/jobs/employer/jobs
 * @desc    Get jobs posted by current employer
 * @access  Private (Employer only)
 */
router.get("/employer/jobs", protect, authorizeRoles("employer"), getMyPostedJobs);

/**
 * @route   GET /api/jobs/employer/jobs/:id/applicants
 * @desc    View applicants for a specific job
 * @access  Private (Employer only)
 */
router.get("/employer/jobs/:id/applicants", protect, authorizeRoles("employer"), validateObjectId("id"), viewApplicants);

/**
 * @route   POST /api/jobs/employer/jobs
 * @desc    Post a new job
 * @access  Private (Employer only)
 * @body    {string} title - Job title
 * @body    {string} description - Job description
 * @body    {string} location - Job location
 * @body    {string} [salary] - Salary range
 * @body    {string} jobType - Job type (Full-time, Part-time, etc.)
 * @body    {array} [requirements] - Job requirements
 * @body    {array} [responsibilities] - Job responsibilities
 * @body    {array} [benefits] - Job benefits
 * @body    {string} [experienceLevel] - Required experience level
 * @body    {date} [applicationDeadline] - Application deadline
 */
router.post("/employer/jobs", protect, authorizeRoles("employer"), postJob);

/**
 * @route   PUT /api/jobs/employer/jobs/:id
 * @desc    Update a job
 * @access  Private (Employer only)
 */
router.put("/:id", protect, authorizeRoles("employer"), validateObjectId("id"), updateJob);

/**
 * @route   DELETE /api/jobs/employer/jobs/:id
 * @desc    Delete a job
 * @access  Private (Employer only)
 */
router.delete("/:id", protect, authorizeRoles("employer"), validateObjectId("id"), deleteJob);

/**
 * @route   PUT /api/jobs/employer/applications/:id/status
 * @desc    Change application status
 * @access  Private (Employer only)
 * @body    {string} status - New status (Pending/Reviewed/Shortlisted/Accepted/Rejected)
 * @body    {string} [notes] - Optional notes about the decision
 */
router.put("/employer/applications/:id/status", protect, authorizeRoles("employer"), validateObjectId("id"), changeApplicationStatus);

// ================= ADMIN ROUTES =================
/**
 * @route   GET /api/jobs/admin/stats
 * @desc    Get job statistics for admin
 * @access  Private (Admin only)
 */
router.get("/admin/stats", protect, authorizeRoles("admin"), getJobStats);
router.patch(
  "/:id/toggle-status",
  protect,
  authorizeRoles("employer"),
  toggleJobStatus
);

// ================= HEALTH CHECK =================
/**
 * @route   GET /api/jobs/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Jobs API is running",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;