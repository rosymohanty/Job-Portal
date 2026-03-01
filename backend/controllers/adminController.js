// adminController.js
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

// ✅ This one you already have
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add placeholder for getUserStats
const getUserStats = async (req, res) => {
  try {
    // Temporary implementation
    const totalUsers = await User.countDocuments();
    const employers = await User.countDocuments({ role: "employer" });
    const jobSeekers = await User.countDocuments({ role: "user" });
    const pendingEmployers = await User.countDocuments({ 
      role: "employer", 
      isApproved: false 
    });
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        employers,
        jobSeekers,
        pendingEmployers
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add placeholder for getUserById
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add placeholder for updateUser
const updateUser = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password update here
    delete updates._id;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add placeholder for deleteUser
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Also delete related applications if user is a job seeker
    if (user.role === "user") {
      await Application.deleteMany({ applicant: user._id });
    }
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add placeholder for toggleUserApproval
const toggleUserApproval = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    user.isApproved = !user.isApproved;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${user.isApproved ? 'approved' : 'disapproved'} successfully`,
      isApproved: user.isApproved
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add placeholder for getAllJobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("employer", "name companyName")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      totalJobs: jobs.length,
      jobs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add placeholder for deleteJob
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: "Job not found" 
      });
    }
    
    // Delete related applications
    await Application.deleteMany({ job: job._id });
    
    res.status(200).json({
      success: true,
      message: "Job deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add placeholder for getAdminDashboardStats
const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalEmployers,
      totalJobSeekers,
      totalJobs,
      totalApplications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "employer" }),
      User.countDocuments({ role: "user" }),
      Job.countDocuments(),
      Application.countDocuments()
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          employers: totalEmployers,
          jobSeekers: totalJobSeekers,
          pendingApproval: await User.countDocuments({ 
            role: "employer", 
            isApproved: false 
          })
        },
        jobs: {
          total: totalJobs,
          active: await Job.countDocuments({ isActive: true })
        },
        applications: {
          total: totalApplications
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ EXPORT ALL FUNCTIONS
module.exports = {
  getAllUsers,
  getUserStats,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserApproval,
  getAllJobs,
  deleteJob,
  getAdminDashboardStats
};