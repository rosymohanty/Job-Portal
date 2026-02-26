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
  getSavedJobs
} = require("../controllers/jobController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
router.get("/", getAllJobs);
router.get("/applied/me", protect, authorizeRoles("user"), viewAppliedJobs);
router.post("/:id/apply", protect, authorizeRoles("user"), applyForJob);
router.get(
  "/employer/dashboard-stats",
  protect,
  authorizeRoles("employer"),
  employerDashboardStats
);
router.get(
  "/employer/my-jobs",
  protect,
  authorizeRoles("employer"),
  getMyPostedJobs
);
router.get(
  "/:id/applicants",
  protect,
  authorizeRoles("employer"),
  viewApplicants
);

// Post new job
router.post("/", protect, authorizeRoles("employer"), postJob);

// Update job
router.put("/:id", protect, authorizeRoles("employer"), updateJob);

// Delete job
router.delete("/:id", protect, authorizeRoles("employer"), deleteJob);

// Change application status
router.put(
  "/applications/:id/status",
  protect,
  authorizeRoles("employer"),
  changeApplicationStatus
);
router.get("/:id", getSingleJob);
// Save / Unsave job
router.post(
  "/:id/save",
  protect,
  authorizeRoles("user"),
  saveJob
);

// Get saved jobs
router.get(
  "/saved",
  protect,
  authorizeRoles("user"),
  getSavedJobs
);
module.exports = router;