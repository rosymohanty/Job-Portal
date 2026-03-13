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
  toggleJobStatus,
  getFeaturedJobs,
  getJobStatsOverview
} = require("../controllers/jobController");

const { protect, authorizeRoles, optionalAuth } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");
const { apiRateLimiter } = require("../middleware/rateLimiterMiddleware");

router.use(apiRateLimiter);


// ================= HEALTH CHECK =================
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Jobs API is running",
    timestamp: new Date().toISOString()
  });
});


// ================= PUBLIC ROUTES =================
router.get("/featured/limit/:limit", getFeaturedJobs);
router.get("/stats/overview", getJobStatsOverview);

router.get("/", optionalAuth, getAllJobs);


// ================= USER ROUTES =================
router.get("/saved", protect, authorizeRoles("user"), getSavedJobs);

router.get("/applied/me", protect, authorizeRoles("user"), viewAppliedJobs);


// ================= EMPLOYER ROUTES =================
router.get("/employer/stats", protect, authorizeRoles("employer"), employerDashboardStats);

router.get("/employer/jobs", protect, authorizeRoles("employer"), getMyPostedJobs);

router.post("/employer/jobs", protect, authorizeRoles("employer"), postJob);

router.get(
  "/employer/jobs/:id/applicants",
  protect,
  authorizeRoles("employer"),
  validateObjectId("id"),
  viewApplicants
);

router.put(
  "/employer/applications/:id/status",
  protect,
  authorizeRoles("employer"),
  validateObjectId("id"),
  changeApplicationStatus
);


// ================= ADMIN ROUTES =================
router.get("/admin/stats", protect, authorizeRoles("admin"), getJobStats);


// ================= DYNAMIC ROUTES (ALWAYS LAST) =================
router.get("/:id/similar", validateObjectId("id"), getSimilarJobs);

router.get("/:id", optionalAuth, validateObjectId("id"), getSingleJob);

router.get(
  "/:id/application-status",
  protect,
  authorizeRoles("user"),
  validateObjectId("id"),
  checkApplicationStatus
);

router.post(
  "/:id/apply",
  protect,
  authorizeRoles("user"),
  validateObjectId("id"),
  applyForJob
);

router.post(
  "/:id/save",
  protect,
  authorizeRoles("user"),
  validateObjectId("id"),
  saveJob
);

router.put(
  "/:id",
  protect,
  authorizeRoles("employer"),
  validateObjectId("id"),
  updateJob
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("employer"),
  validateObjectId("id"),
  deleteJob
);

router.patch(
  "/:id/toggle-status",
  protect,
  authorizeRoles("employer"),
  toggleJobStatus
);

module.exports = router;