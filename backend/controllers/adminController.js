const User = require("../models/User");

// ADMIN - GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      totalUsers: users.length,
      users,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers };