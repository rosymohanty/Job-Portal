const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  registerEmployer,
  loginEmployer,
  getProfile,
  updateProfile, 
  changePassword, 
  uploadResume, 
  updateUserProfile, 
  deleteUserAccount,
  deleteEmployerAccount,
  logout
} = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { validateRegistration, validateLogin, validatePasswordChange } = require("../middleware/authValidationMiddleware");

// Public routes
router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.post("/register-employer", validateRegistration, registerEmployer);
router.post("/login-employer", validateLogin, loginEmployer);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, validatePasswordChange, changePassword);
router.post("/logout", protect, logout);

// Job seeker routes
router.put("/user-profile", protect, authorizeRoles("user"), updateUserProfile);
router.post("/upload-resume", protect, authorizeRoles("user"), upload.single("resume"), uploadResume);
router.delete("/account", protect, authorizeRoles("user"), deleteUserAccount);

// Employer routes
router.delete("/employer-account", protect, authorizeRoles("employer"), deleteEmployerAccount);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth API is running",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;