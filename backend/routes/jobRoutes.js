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


// ================= PUBLIC ROUTES =================

router.get("/", getAllJobs);


// ================= USER ROUTES =================

// View applied jobs
router.get(
  "/applied/me",
  protect,
  authorizeRoles("user"),
  viewAppliedJobs
);

// Apply for job
router.post(
  "/:id/apply",
  protect,
  authorizeRoles("user"),
  applyForJob
);

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

// Get Application Timeline (VERY IMPORTANT: keep above /:id)



// ================= EMPLOYER ROUTES =================

// Dashboard Stats
router.get(
  "/employer/dashboard-stats",
  protect,
  authorizeRoles("employer"),
  employerDashboardStats
);

// My posted jobs
router.get(
  "/employer/my-jobs",
  protect,
  authorizeRoles("employer"),
  getMyPostedJobs
);

// View applicants
router.get(
  "/:id/applicants",
  protect,
  authorizeRoles("employer"),
  viewApplicants
);

// Post new job
router.post(
  "/",
  protect,
  authorizeRoles("employer"),
  postJob
);

// Update job
router.put(
  "/:id",
  protect,
  authorizeRoles("employer"),
  updateJob
);

// Delete job
router.delete(
  "/:id",
  protect,
  authorizeRoles("employer"),
  deleteJob
);

// Change application status
router.put(
  "/applications/:id/status",
  protect,
  authorizeRoles("employer"),
  changeApplicationStatus
);


// ================= MUST BE LAST =================

// Get single job (KEEP LAST to avoid route conflict)
router.get("/:id", getSingleJob);


module.exports = router;