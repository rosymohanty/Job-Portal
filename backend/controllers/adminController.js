// adminController.js
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const AuditLog = require("../models/AuditLog"); // Make sure to create this model
const mongoose = require('mongoose');

// ✅ Enhanced error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ✅ Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const employers = await User.countDocuments({ role: "employer" });
    const jobSeekers = await User.countDocuments({ role: "user" });
    const pendingEmployers = await User.countDocuments({ 
      role: "employer", 
      isApproved: false 
    });
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          employers,
          jobSeekers,
          pendingEmployers
        }
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching user statistics" 
    });
  }
};

// ✅ Improved getAllUsers with pagination
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: page < Math.ceil(totalUsers / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching users",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Improved getUserById with validation
const getUserById = async (req, res) => {
  try {
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }

    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching user" 
    });
  }
};

// ✅ Improved updateUser with field restrictions
const updateUser = async (req, res) => {
  try {
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }

    // Fields that cannot be updated by admin (for security)
    const restrictedFields = ['password', '_id', 'createdAt', '__v', 'role'];
    
    // Create a sanitized updates object
    const updates = {};
    const allowedFields = ['name', 'email', 'phone', 'companyName', 'bio', 'skills', 'location', 'profilePicture', 'isApproved'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && !restrictedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Check if there's anything to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid fields to update" 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
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
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error updating user" 
    });
  }
};

// ✅ Toggle user approval status
const toggleUserApproval = async (req, res) => {
  try {
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Only employers need approval
    if (user.role !== "employer") {
      return res.status(400).json({
        success: false,
        message: "Only employer accounts can be toggled for approval"
      });
    }
    
    user.isApproved = !user.isApproved;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${user.isApproved ? 'approved' : 'disapproved'} successfully`,
      data: { isApproved: user.isApproved }
    });
  } catch (error) {
    console.error('Toggle user approval error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error toggling user approval" 
    });
  }
};

// ✅ Improved deleteUser with transaction support
const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }

    const user = await User.findById(req.params.id).session(session);
    
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Delete related data based on user role
    if (user.role === "user") {
      await Application.deleteMany({ applicant: user._id }).session(session);
    } else if (user.role === "employer") {
      const jobs = await Job.find({ employer: user._id }).session(session);
      const jobIds = jobs.map(job => job._id);
      await Job.deleteMany({ employer: user._id }).session(session);
      await Application.deleteMany({ job: { $in: jobIds } }).session(session);
    }
    
    // Delete user
    await User.findByIdAndDelete(req.params.id).session(session);
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      message: "User and related data deleted successfully"
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting user" 
    });
  }
};

// ✅ Delete a specific job
const deleteJob = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: "Invalid job ID format" 
      });
    }

    const job = await Job.findById(req.params.id).session(session);
    
    if (!job) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: "Job not found" 
      });
    }
    
    // Delete related applications
    await Application.deleteMany({ job: job._id }).session(session);
    
    // Delete the job
    await Job.findByIdAndDelete(req.params.id).session(session);
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      message: "Job and related applications deleted successfully"
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Delete job error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting job" 
    });
  }
};

// ✅ Improved getAllJobs with filtering and pagination
const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter = {};
    if (req.query.status) {
      filter.isActive = req.query.status === 'active';
    }
    if (req.query.employerId) {
      filter.employer = req.query.employerId;
    }

    const jobs = await Job.find(filter)
      .populate("employer", "name companyName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalJobs = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalJobs / limit),
          totalJobs,
          hasNext: page < Math.ceil(totalJobs / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching jobs" 
    });
  }
};

// ✅ Improved getAdminDashboardStats with better error handling
const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalEmployers,
      totalJobSeekers,
      totalJobs,
      totalApplications,
      activeJobs,
      pendingEmployers,
      recentApplications,
      recentJobs,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "employer" }),
      User.countDocuments({ role: "user" }),
      Job.countDocuments(),
      Application.countDocuments(),
      Job.countDocuments({ isActive: true }),
      User.countDocuments({ role: "employer", isApproved: false }),
      Application.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } }),
      Job.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          users: {
            total: totalUsers,
            employers: totalEmployers,
            jobSeekers: totalJobSeekers,
            pendingApproval: pendingEmployers
          },
          jobs: {
            total: totalJobs,
            active: activeJobs,
            recent: recentJobs
          },
          applications: {
            total: totalApplications,
            recent: recentApplications
          }
        },
        trends: {
          newUsersLastWeek: recentUsers,
          newJobsLastWeek: recentJobs,
          newApplicationsLastWeek: recentApplications
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching dashboard statistics" 
    });
  }
};

// ✅ Bulk approve employers
const bulkApproveEmployers = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Please provide an array of user IDs"
      });
    }
    
    const result = await User.updateMany(
      { 
        _id: { $in: userIds },
        role: "employer"
      },
      { $set: { isApproved: true } },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} employers approved successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Bulk approve error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to bulk approve employers" 
    });
  }
};

// ✅ Bulk delete users
const bulkDeleteUsers = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Please provide an array of user IDs"
      });
    }
    
    // Get all users to delete
    const users = await User.find({ _id: { $in: userIds } }).session(session);
    
    // Delete related data for each user
    for (const user of users) {
      if (user.role === "user") {
        await Application.deleteMany({ applicant: user._id }).session(session);
      } else if (user.role === "employer") {
        const jobs = await Job.find({ employer: user._id }).session(session);
        const jobIds = jobs.map(job => job._id);
        await Job.deleteMany({ employer: user._id }).session(session);
        await Application.deleteMany({ job: { $in: jobIds } }).session(session);
      }
    }
    
    // Delete the users
    const result = await User.deleteMany({ _id: { $in: userIds } }).session(session);
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} users and their related data deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Bulk delete error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to bulk delete users" 
    });
  }
};

// ✅ Get admin audit logs
const getAdminAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, adminId, action } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const filter = {};
    if (adminId) filter.admin = adminId;
    if (action) filter.action = new RegExp(action, 'i');
    
    const logs = await AuditLog.find(filter)
      .populate('admin', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const total = await AuditLog.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch audit logs" 
    });
  }
};

// ✅ Export users data (CSV format)
const exportUsersData = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .lean();
    
    // Format data for CSV
    const formattedUsers = users.map(user => ({
      ID: user._id,
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Company: user.companyName || 'N/A',
      Phone: user.phone || 'N/A',
      Approved: user.isApproved ? 'Yes' : 'No',
      'Created At': new Date(user.createdAt).toLocaleDateString(),
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
    }));
    
    res.status(200).json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    console.error("Export users error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to export users data" 
    });
  }
};

// ✅ Export jobs data (CSV format)
const exportJobsData = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("employer", "name companyName email")
      .sort({ createdAt: -1 })
      .lean();
    
    // Format data for CSV
    const formattedJobs = jobs.map(job => ({
      ID: job._id,
      Title: job.title,
      Employer: job.employer?.companyName || job.employer?.name || 'Unknown',
      Location: job.location,
      Type: job.jobType,
      Salary: job.salary || 'Not specified',
      Active: job.isActive ? 'Yes' : 'No',
      'Created At': new Date(job.createdAt).toLocaleDateString(),
      'Applications': job.applicationCount || 0
    }));
    
    res.status(200).json({
      success: true,
      data: formattedJobs
    });
  } catch (error) {
    console.error("Export jobs error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to export jobs data" 
    });
  }
};

// ✅ EXPORT ALL FUNCTIONS
module.exports = {
  // User management
  getAllUsers,
  getUserStats,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserApproval,
  
  // Job management
  getAllJobs,
  deleteJob,
  
  // Dashboard
  getAdminDashboardStats,
  
  // Bulk operations
  bulkApproveEmployers,
  bulkDeleteUsers,
  
  // Audit and export
  getAdminAuditLogs,
  exportUsersData,
  exportJobsData
};