const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getAllUsers } = require("../controllers/adminController");

// ADMIN ROUTE
router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

module.exports = router;