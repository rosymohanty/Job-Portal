const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const mongoose = require("mongoose");


// =============================
// Get User Statistics
// =============================
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const employers = await User.countDocuments({ role: "employer" });
    const jobSeekers = await User.countDocuments({ role: "user" });

    res.json({
      success: true,
      data: {
        totalUsers,
        employers,
        jobSeekers
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success:false, message:"Server error"});
  }
};


// =============================
// Get All Users
// =============================
const getAllUsers = async (req, res) => {
  try {

    const users = await User.find().select("-password");

    res.json({
      success:true,
      users
    });

  } catch (error) {
    res.status(500).json({ success:false, message:"Server error"});
  }
};


// =============================
// Get User By ID
// =============================
const getUserById = async (req,res)=>{
  try{

    const user = await User.findById(req.params.id).select("-password");

    if(!user){
      return res.status(404).json({message:"User not found"});
    }

    res.json({
      success:true,
      user
    });

  }catch(error){
    res.status(500).json({message:"Server error"});
  }
};


// =============================
// Update User
// =============================
const updateUser = async (req,res)=>{
  try{

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new:true }
    ).select("-password");

    res.json({
      success:true,
      user
    });

  }catch(error){
    res.status(500).json({message:"Server error"});
  }
};


// =============================
// Delete User
// =============================
const deleteUser = async (req,res)=>{
  try{

    const user = await User.findById(req.params.id);

    if(!user){
      return res.status(404).json({message:"User not found"});
    }

    await user.deleteOne();

    res.json({
      success:true,
      message:"User deleted"
    });

  }catch(error){
    res.status(500).json({message:"Server error"});
  }
};


// =============================
// Get All Jobs
// =============================
const getAllJobs = async (req,res)=>{
  try{

    const jobs = await Job.find().populate("employer","name email");

    res.json({
      success:true,
      jobs
    });

  }catch(error){
    res.status(500).json({message:"Server error"});
  }
};


// =============================
// Delete Job
// =============================
const deleteJob = async (req,res)=>{
  try{

    const job = await Job.findById(req.params.id);

    if(!job){
      return res.status(404).json({message:"Job not found"});
    }

    await job.deleteOne();

    res.json({
      success:true,
      message:"Job deleted"
    });

  }catch(error){
    res.status(500).json({message:"Server error"});
  }
};


// =============================
// Admin Dashboard Stats
// =============================
const getAdminDashboardStats = async (req,res)=>{
  try{

    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    res.json({
      success:true,
      data:{
        totalUsers,
        totalJobs,
        totalApplications
      }
    });

  }catch(error){
    res.status(500).json({message:"Server error"});
  }
};
// =============================
// Toggle Employer Approval
// =============================
const toggleUserApproval = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // toggle approval
    user.isApproved = !user.isApproved;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User approval status updated",
      data: user
    });

  } catch (error) {

    console.error("Toggle approval error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update approval status"
    });

  }
};

module.exports = {
  getUserStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllJobs,
  deleteJob,
  getAdminDashboardStats,
  toggleUserApproval
};