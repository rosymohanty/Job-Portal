const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");

const {
  getAllUsers,
  getUserStats,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserApproval,
  getAllJobs,
  deleteJob,
  getAdminDashboardStats
} = require("../controllers/adminController");


// ================= Protect all admin routes =================
router.use(protect);
router.use(authorizeRoles("admin"));


// ================= USER MANAGEMENT =================

// Get all users
router.get("/users", getAllUsers);

// Get user stats
router.get("/users/stats", getUserStats);

// Get single user
router.get("/users/:id", validateObjectId("id"), getUserById);

// Update user
router.put("/users/:id", validateObjectId("id"), updateUser);

// Delete user
router.delete("/users/:id", validateObjectId("id"), deleteUser);

// Toggle employer approval
router.patch(
  "/users/:id/toggle-approval",
  validateObjectId("id"),
  toggleUserApproval
);


// ================= JOB MANAGEMENT =================

// Get all jobs
router.get("/jobs", getAllJobs);

// Delete job
router.delete("/jobs/:id", validateObjectId("id"), deleteJob);


// ================= ADMIN DASHBOARD =================

// Admin dashboard stats
router.get("/dashboard/stats", getAdminDashboardStats);


// ================= HEALTH CHECK =================

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Admin API running",
    admin: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;