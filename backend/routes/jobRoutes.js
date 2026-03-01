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
  checkApplicationStatus  // Added missing import
} = require("../controllers/jobController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ================= PUBLIC ROUTES =================
router.get("/", getAllJobs);
router.get("/:id", getSingleJob); // MOVED UP - important!

// ================= USER ROUTES =================
router.get("/applied/me", protect, authorizeRoles("user"), viewAppliedJobs);
router.get("/:id/application-status", protect, authorizeRoles("user"), checkApplicationStatus);
router.post("/:id/apply", protect, authorizeRoles("user"), applyForJob);
router.post("/:id/save", protect, authorizeRoles("user"), saveJob);
router.get("/saved", protect, authorizeRoles("user"), getSavedJobs);

// ================= EMPLOYER ROUTES =================
router.get("/employer/dashboard", protect, authorizeRoles("employer"), employerDashboardStats);
router.get("/employer/jobs", protect, authorizeRoles("employer"), getMyPostedJobs);
router.get("/employer/jobs/:id/applicants", protect, authorizeRoles("employer"), viewApplicants);
router.post("/employer/jobs", protect, authorizeRoles("employer"), postJob);
router.put("/employer/jobs/:id", protect, authorizeRoles("employer"), updateJob);
router.delete("/employer/jobs/:id", protect, authorizeRoles("employer"), deleteJob);
router.put("/employer/applications/:id/status", protect, authorizeRoles("employer"), changeApplicationStatus);

module.exports = router;