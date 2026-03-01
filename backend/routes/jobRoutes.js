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
  getJobStats,           // Added for stats overview
  getFeaturedJobs        // Added for featured jobs
} = require("../controllers/jobController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ================= PUBLIC ROUTES (No Authentication Required) =================
router.get("/", getAllJobs);
router.get("/:id", getSingleJob);
router.get("/stats/overview", getJobStats);              // Get job statistics
router.get("/featured/limit/:count", getFeaturedJobs);   // Get featured jobs

// ================= USER ROUTES (Job Seekers Only) =================
router.get("/applied/me", protect, authorizeRoles("user"), viewAppliedJobs);
router.get("/saved", protect, authorizeRoles("user"), getSavedJobs);
router.get("/:id/application-status", protect, authorizeRoles("user"), checkApplicationStatus);
router.post("/:id/apply", protect, authorizeRoles("user"), applyForJob);
router.post("/:id/save", protect, authorizeRoles("user"), saveJob);

// ================= EMPLOYER ROUTES (Employers Only) =================
// Dashboard
router.get("/employer/dashboard", protect, authorizeRoles("employer"), employerDashboardStats);

// Job management
router.get("/employer/jobs", protect, authorizeRoles("employer"), getMyPostedJobs);
router.post("/employer/jobs", protect, authorizeRoles("employer"), postJob);
router.put("/employer/jobs/:id", protect, authorizeRoles("employer"), updateJob);
router.delete("/employer/jobs/:id", protect, authorizeRoles("employer"), deleteJob);

// Applicant management
router.get("/employer/jobs/:id/applicants", protect, authorizeRoles("employer"), viewApplicants);
router.put("/employer/applications/:id/status", protect, authorizeRoles("employer"), changeApplicationStatus);

module.exports = router;