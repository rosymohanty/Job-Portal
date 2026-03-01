// authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Application = require("../models/Application");

// @desc    Register a new user (job seeker)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide all required fields" 
      });
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "user",
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "30d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ 
      success: false,
      message: "Registration failed. Please try again." 
    });
  }
};

// @desc    Login user (job seeker)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide email and password" 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check if user is approved (for employers)
    if (user.role === "employer" && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your employer account is pending admin approval",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "30d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Login failed. Please try again." 
    });
  }
};

// @desc    Register employer
// @route   POST /api/auth/register-employer
// @access  Public
const registerEmployer = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      companyName,
      companyWebsite,
      companyLocation,
      phone
    } = req.body;

    // Validation
    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide all required fields (name, email, password, companyName)" 
      });
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if employer exists
    const employerExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (employerExists) {
      return res.status(400).json({ 
        success: false,
        message: "Employer already exists with this email" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create employer
    const employer = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "employer",
      companyName: companyName.trim(),
      companyWebsite: companyWebsite?.trim(),
      companyLocation: companyLocation?.trim(),
      phone: phone?.trim(),
      isApproved: false, // Employers need admin approval
    });

    // Don't send token for employer registration - they need admin approval first
    res.status(201).json({
      success: true,
      message: "Employer registered successfully. Waiting for admin approval",
      employer: {
        _id: employer._id,
        name: employer.name,
        email: employer.email,
        role: employer.role,
        companyName: employer.companyName,
        isApproved: employer.isApproved,
      },
    });
  } catch (error) {
    console.error("Register employer error:", error);
    res.status(500).json({ 
      success: false,
      message: "Registration failed. Please try again." 
    });
  }
};

// @desc    Login employer
// @route   POST /api/auth/login-employer
// @access  Public
const loginEmployer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide email and password" 
      });
    }

    // Find employer
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      role: "employer" 
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check approval status
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your employer account is pending admin approval",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "30d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error("Login employer error:", error);
    res.status(500).json({ 
      success: false,
      message: "Login failed. Please try again." 
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .lean();

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch profile" 
    });
  }
};

// @desc    Update profile (for all users)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = {};

    // Common fields
    if (req.body.name) updates.name = req.body.name.trim();
    if (req.body.phone) updates.phone = req.body.phone.trim();
    if (req.body.bio) updates.bio = req.body.bio.trim();

    // Employer-specific fields
    if (req.user.role === "employer") {
      if (req.body.companyName) updates.companyName = req.body.companyName.trim();
      if (req.body.companyWebsite) updates.companyWebsite = req.body.companyWebsite.trim();
      if (req.body.companyLocation) updates.companyLocation = req.body.companyLocation.trim();
    }

    // User-specific fields
    if (req.user.role === "user") {
      if (req.body.skills) {
        // Convert skills string to array if needed
        updates.skills = Array.isArray(req.body.skills) 
          ? req.body.skills 
          : req.body.skills.split(',').map(skill => skill.trim());
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update profile" 
    });
  }
};

// @desc    Update user profile (job seeker specific)
// @route   PUT /api/auth/user-profile
// @access  Private (User only)
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is a job seeker
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only job seekers can update this profile.",
      });
    }

    const { name, phone, bio, skills } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Update fields
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (bio) user.bio = bio.trim();
    if (skills) {
      // Handle skills as array or comma-separated string
      user.skills = Array.isArray(skills) 
        ? skills 
        : skills.split(',').map(skill => skill.trim());
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        resume: updatedUser.resume,
      },
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update profile" 
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide both old and new password" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from old password",
      });
    }

    // Find user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to change password" 
    });
  }
};

// @desc    Upload resume
// @route   POST /api/auth/upload-resume
// @access  Private (User only)
const uploadResume = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is a job seeker
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only job seekers can upload resumes",
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No file uploaded" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Store file path (you might want to store just the filename)
    user.resume = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumePath: user.resume,
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to upload resume" 
    });
  }
};

// @desc    Delete user account (job seeker)
// @route   DELETE /api/auth/account
// @access  Private (User only)
const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is a job seeker
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only job seekers can delete this account.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Delete all applications by this user
    await Application.deleteMany({ applicant: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User account and related applications deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete account" 
    });
  }
};

// @desc    Delete employer account
// @route   DELETE /api/auth/employer-account
// @access  Private (Employer only)
const deleteEmployerAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is an employer
    if (req.user.role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only employers can delete this account.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Delete all jobs posted by this employer
    const Job = require("../models/Job");
    await Job.deleteMany({ employer: userId });

    // Delete all applications for jobs posted by this employer
    await Application.deleteMany({ employer: userId });

    // Delete the employer
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Employer account, jobs, and related applications deleted successfully",
    });
  } catch (error) {
    console.error("Delete employer account error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete account" 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  // Since we're using JWT, we just inform the client to delete the token
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// ✅ EXPORT ALL FUNCTIONS
module.exports = {
  register,
  login,
  registerEmployer,
  loginEmployer,
  getProfile,
  updateProfile,
  updateUserProfile,
  changePassword,
  uploadResume,
  deleteUserAccount,
  deleteEmployerAccount,
  logout,
};