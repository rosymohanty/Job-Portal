const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  registerEmployer,
  loginEmployer,  // Added missing import
  getProfile,
  updateProfile, 
  changePassword, 
  uploadResume, 
  updateUserProfile, 
  deleteUserAccount,
  logout  // Added missing import
} = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/register-employer", registerEmployer);
router.post("/login-employer", loginEmployer);  // Added missing route

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/logout", protect, logout);  // Added logout

// Job seeker specific routes
router.put("/update-user-profile", protect, authorizeRoles("user"), updateUserProfile);
router.post("/upload-resume", protect, authorizeRoles("user"), upload.single("resume"), uploadResume);
router.delete("/delete-account", protect, authorizeRoles("user"), deleteUserAccount);

// Employer specific routes
router.delete("/delete-employer-account", protect, authorizeRoles("employer"), require("../controllers/authController").deleteEmployerAccount);

module.exports = router;