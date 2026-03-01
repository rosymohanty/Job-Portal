const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
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

// All admin routes are protected
router.use(protect);
router.use(authorizeRoles("admin"));

// User management
router.get("/users", getAllUsers);
router.get("/users/stats", getUserStats);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/toggle-approval", toggleUserApproval);

// Job management
router.get("/jobs", getAllJobs);
router.delete("/jobs/:id", deleteJob);

// Dashboard
router.get("/dashboard/stats", getAdminDashboardStats);

module.exports = router;