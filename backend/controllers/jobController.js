// jobController.js
const Job = require("../models/Job");
const User = require("../models/User");
const mongoose = require("mongoose");
const Application = require("../models/Application");
const fs = require('fs').promises;
const sanitizeHtml = require('sanitize-html');

// Helper function to validate file existence
const validateResumeFile = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

// Helper function to sanitize input
const sanitizeContent = (content) => {
  if (!content) return content;
  return sanitizeHtml(content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {}
  });
};

// @desc    Get all jobs (public)
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const { 
      keyword, 
      location, 
      jobType, 
      minSalary, 
      maxSalary, 
      experienceLevel,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter
    let filter = { isActive: true };
    
    // Search by keyword in title or description
    if (keyword && typeof keyword === "string") {
      filter.$or = [
        { title: { $regex: keyword.trim(), $options: "i" } },
        { description: { $regex: keyword.trim(), $options: "i" } }
      ];
    }
    
    // Filter by location
    if (location && typeof location === "string") {
      filter.location = { $regex: location.trim(), $options: "i" };
    }
    
    // Filter by job type
    if (jobType && jobType !== "all") {
      filter.jobType = jobType;
    }

    // Filter by experience level
    if (experienceLevel && experienceLevel !== "all") {
      filter.experienceLevel = experienceLevel;
    }

    // Filter by salary range
    if (minSalary || maxSalary) {
      filter.$expr = {};
      if (minSalary) {
        filter.$expr.$gte = [{ $toInt: "$salary" }, parseInt(minSalary)];
      }
      if (maxSalary) {
        filter.$expr.$lte = [{ $toInt: "$salary" }, parseInt(maxSalary)];
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get jobs with pagination
    const jobs = await Job.find(filter)
      .populate("employer", "name email companyName companyLocation companyLogo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limitNum);

    // Add application status for logged-in users
    if (req.user) {
      const jobIds = jobs.map(job => job._id);
      const userApplications = await Application.find({
        applicant: req.user._id,
        job: { $in: jobIds }
      }).select('job status').lean();

      const applicationMap = userApplications.reduce((map, app) => {
        map[app.job.toString()] = app.status;
        return map;
      }, {});

      jobs.forEach(job => {
        job.userApplied = !!applicationMap[job._id.toString()];
        job.applicationStatus = applicationMap[job._id.toString()] || null;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          total: totalJobs,
          totalPages,
          currentPage: pageNum,
          perPage: limitNum,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error("Get all jobs error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch jobs" 
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getSingleJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid job ID format" 
      });
    }

    const job = await Job.findById(id)
      .populate("employer", "name email companyName companyLocation companyWebsite companyLogo")
      .lean();

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    // Increment view count
    await Job.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // Check if current user has applied
    if (req.user) {
      const application = await Application.findOne({
        job: id,
        applicant: req.user._id
      }).select('status').lean();
      
      job.userApplied = !!application;
      job.applicationStatus = application?.status || null;
    }

    res.status(200).json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error("Get single job error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch job" 
    });
  }
};

// @desc    Post a new job (Employer only)
// @route   POST /api/jobs
// @access  Private (Employer only)
// In your jobController.js - update the postJob function

// @desc    Post a new job (Employer only)
// @route   POST /api/jobs/employer/jobs
// @access  Private (Employer only)
// @desc    Post a new job (Employer only)
// @route   POST /api/jobs/employer/jobs
// @access  Private (Employer only)
// @desc    Post a new job (Employer only)
// @route   POST /api/jobs/employer/jobs
// @access  Private (Employer only)
// @desc    Post a new job (Employer only)
// @route   POST /api/jobs/employer/jobs
// @access  Private (Employer only)
// @desc    Post a new job (Employer only)
// @route   POST /api/jobs/employer/jobs
// @access  Private (Employer only)
const postJob = async (req, res) => {
  try {
    const employerId = req.user._id;

    // Check if employer exists and is approved
    const employer = await User.findById(employerId);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found"
      });
    }

    if (!employer.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your employer account is pending admin approval. You cannot post jobs yet.",
      });
    }

    const { 
      title, 
      description, 
      location, 
      salary, 
      jobType, 
      requirements, 
      responsibilities, 
      benefits, 
      experienceLevel, 
      applicationDeadline 
    } = req.body;

    // Validation
    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and location are required",
      });
    }

    // Prepare job data
    // In your jobController.js, update the jobData creation:
const jobData = {
  title: title.trim(),
  description: description.trim(),
  location: location.trim(),
  salary: salary?.trim() || "",
  jobType: jobType || "Full-time",
  experienceLevel: experienceLevel || "Entry",
  employer: employerId,
  isActive: true,
  applicants: [],
  applicationCount: 0,  // Set explicitly
  views: 0,
  requirements: Array.isArray(requirements) ? requirements.filter(r => r && r.trim() !== "").map(r => r.trim()) : [],
  responsibilities: Array.isArray(responsibilities) ? responsibilities.filter(r => r && r.trim() !== "").map(r => r.trim()) : [],
  benefits: Array.isArray(benefits) ? benefits.filter(b => b && b.trim() !== "").map(b => b.trim()) : [],
};

    if (applicationDeadline) {
      jobData.applicationDeadline = new Date(applicationDeadline);
    }

    // Create job
    const job = await Job.create(jobData);

    // Populate employer info for response
    const populatedJob = await Job.findById(job._id).populate(
      "employer",
      "name email companyName"
    );

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      data: { job: populatedJob },
    });
  } catch (error) {
    console.error("Post job error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Failed to post job. Please try again."
    });
  }
};
// @desc    Update a job (Employer only)
// @route   PUT /api/jobs/:id
// @access  Private (Employer only)
const updateJob = async (req, res) => {
  try {
    const employerId = req.user._id;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    if (!job.employer || job.employer.toString() !== employerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job"
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob
    });

  } catch (error) {
    console.error("Update job error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
// @desc    Delete a job (Employer only)
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only)
const deleteJob = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const employerId = req.user._id;
    const jobId = req.params.id;

    // Validate job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "Invalid job ID format" 
      });
    }

    // Find job with session
    const job = await Job.findById(jobId).session(session);
    if (!job) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    // Check authorization
    if (job.employer.toString() !== employerId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this job",
      });
    }

    // Get all applications to collect resume paths
    const applications = await Application.find({ job: jobId }).session(session);
    const resumePaths = applications.map(app => app.resume).filter(Boolean);

    // Delete related applications
    await Application.deleteMany({ job: jobId }).session(session);

    // Delete the job
    await Job.findByIdAndDelete(jobId).session(session);

    await session.commitTransaction();
    session.endSession();

    // Clean up resume files after successful transaction
    for (const resumePath of resumePaths) {
      try {
        await fs.unlink(resumePath);
      } catch (error) {
        console.error(`Failed to delete resume file: ${resumePath}`, error);
      }
    }

    res.status(200).json({
      success: true,
      message: "Job and related applications deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Delete job error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete job" 
    });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (User only)
const applyForJob = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const jobId = req.params.id;

    // Check if user is a job seeker
    if (req.user.role !== "user") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Only job seekers can apply for jobs",
      });
    }

    // Validate job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "Invalid job ID" 
      });
    }

    // Find job with session
    const job = await Job.findById(jobId).session(session);
    if (!job) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    // Check if job is active
    if (!job.isActive) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "This job is no longer active" 
      });
    }

    // Check if deadline has passed
    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "Application deadline has passed" 
      });
    }

    // Get user with session
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if user has uploaded resume
    if (!user.resume) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Please upload a resume before applying",
      });
    }

    // Validate resume file exists
    const resumeExists = await validateResumeFile(user.resume);
    if (!resumeExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Your resume file is missing. Please upload again.",
      });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: userId,
    }).session(session);

    if (alreadyApplied) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Verify employer exists
    if (!job.employer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "Job has no associated employer" 
      });
    }

    // Create application
    const application = await Application.create([{
      job: jobId,
      applicant: userId,
      employer: job.employer,
      status: "Pending",
      resume: user.resume,
      appliedAt: new Date(),
      coverLetter: req.body.coverLetter || null,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Job applied successfully",
      data: {
        application: {
          _id: application[0]._id,
          status: application[0].status,
          appliedAt: application[0].createdAt,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Apply for job error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "Validation failed", 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Failed to apply for job" 
    });
  }
};

// @desc    View applied jobs for current user
// @route   GET /api/jobs/applied
// @access  Private (User only)
const viewAppliedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const applications = await Application.find({
      applicant: req.user._id
    })
      .populate({
        path: "job",
        select: "title location salary jobType description createdAt employer",
        populate: {
          path: "employer",
          select: "name companyName companyLocation companyLogo"
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalApplications = await Application.countDocuments({
      applicant: req.user._id
    });

    const totalPages = Math.ceil(totalApplications / limitNum);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          total: totalApplications,
          totalPages,
          currentPage: pageNum,
          perPage: limitNum,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error("View applied jobs error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch applied jobs" 
    });
  }
};

// @desc    Get jobs posted by current employer
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer only)
// @desc    Get jobs posted by current employer
// @route   GET /api/jobs/employer/jobs
// @access  Private (Employer only)

const getMyPostedJobs = async (req, res) => {
  try {
    const employerId = req.user._id;

    const jobs = await Job.find({ employer: employerId })
      .sort({ createdAt: -1 })
      .lean();

    const jobIds = jobs.map(job => job._id);

    // Get applicant count
    const applicantStats = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: "$job",
          totalApplicants: { $sum: 1 }
        }
      }
    ]);

    const applicantCountMap = applicantStats.reduce((map, stat) => {
      map[stat._id.toString()] = stat.totalApplicants;
      return map;
    }, {});

    const jobsWithStats = jobs.map(job => ({
      ...job,
      applicantCount: applicantCountMap[job._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      jobs: jobsWithStats,
      totalJobs: jobsWithStats.length
    });

  } catch (error) {
    console.error("Get my posted jobs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs"
    });
  }
};
// @desc    View applicants for a specific job
// @route   GET /api/jobs/:id/applicants
// @access  Private (Employer only)
const viewApplicants = async (req, res) => {
  try {
    const employerId = req.user._id;
    const jobId = req.params.id;

    // Validate job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid job ID format" 
      });
    }

    // Find job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    // Check authorization
    if (job.employer.toString() !== employerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view applicants for this job",
      });
    }

    // Get applications with pagination
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { job: jobId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate({
        path: "applicant",
        select: "name email phone bio skills resume createdAt",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalApplicants = await Application.countDocuments(filter);
    const totalPages = Math.ceil(totalApplicants / limitNum);

    // Get status counts
    const statusCounts = await Application.aggregate([
      { $match: { job: job._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusCountMap = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        jobTitle: job.title,
        applicants: applications,
        stats: {
          total: totalApplicants,
          ...statusCountMap
        },
        pagination: {
          total: totalApplicants,
          totalPages,
          currentPage: pageNum,
          perPage: limitNum,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error("View applicants error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch applicants" 
    });
  }
};

// @desc    Change application status
// @route   PUT /api/jobs/applications/:id/status
// @access  Private (Employer only)
const changeApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const employerId = req.user._id;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ["Pending", "Reviewed", "Shortlisted", "Accepted", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status. Valid statuses: " + validStatuses.join(", ")
      });
    }

    // Validate application ID
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid application ID format" 
      });
    }

    // Find application
    const application = await Application.findById(applicationId)
      .populate("job");

    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: "Application not found" 
      });
    }

    if (!application.job) {
      return res.status(400).json({ 
        success: false,
        message: "Associated job not found" 
      });
    }

    // Check authorization
    if (application.job.employer.toString() !== employerId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "You are not authorized to update this application" 
      });
    }

    // Update status
    application.status = status;
    if (notes) {
      application.notes = notes;
    }
    application.updatedAt = new Date();

    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: {
        application: {
          _id: application._id,
          status: application.status,
          job: application.job.title,
          applicant: application.applicant,
        },
      }
    });
  } catch (error) {
    console.error("Change application status error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update application status" 
    });
  }
};

// @desc    Get employer dashboard statistics
// @route   GET /api/jobs/employer/stats
// @access  Private (Employer only)
const employerDashboardStats = async (req, res) => {
  try {
    const employerId = req.user._id;

    // Get all employer jobs
    const employerJobs = await Job.find({ employer: employerId }).select("_id");
    const jobIds = employerJobs.map(job => job._id);

    // Get statistics in parallel
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      applicationsByStatus,
      recentApplications,
      jobsByType
    ] = await Promise.all([
      // Total jobs
      Job.countDocuments({ employer: employerId }),
      
      // Active jobs
      Job.countDocuments({ employer: employerId, isActive: true }),
      
      // Total applications
      Application.countDocuments({ job: { $in: jobIds } }),
      
      // Applications by status
      Application.aggregate([
        { $match: { job: { $in: jobIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      
      // Recent 5 applications
      Application.find({ job: { $in: jobIds } })
        .populate("job", "title")
        .populate("applicant", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      
      // Jobs by type
      Job.aggregate([
        { $match: { employer: employerId } },
        { $group: { _id: "$jobType", count: { $sum: 1 } } }
      ])
    ]);

    // Format status counts
    const statusCounts = {
      Pending: 0,
      Reviewed: 0,
      Shortlisted: 0,
      Accepted: 0,
      Rejected: 0
    };

    applicationsByStatus.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    // Format jobs by type
    const jobsByTypeMap = {};
    jobsByType.forEach(item => {
      jobsByTypeMap[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalJobs,
          activeJobs,
          totalApplications,
          applicationRate: totalJobs > 0 
            ? Number((totalApplications / totalJobs).toFixed(1))
            : 0,
        },
        statusBreakdown: statusCounts,
        jobsByType: jobsByTypeMap,
        recentApplications
      }
    });
  } catch (error) {
    console.error("Employer dashboard stats error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch dashboard statistics" 
    });
  }
};

// @desc    Save or unsave a job
// @route   POST /api/jobs/:id/save
// @access  Private (User only)
const saveJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;

    // Check if user is a job seeker
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only job seekers can save jobs",
      });
    }

    // Validate job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid job ID" 
      });
    }

    // Check if job exists and is active
    const job = await Job.findOne({ _id: jobId, isActive: true });
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found or no longer active" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const alreadySaved = user.savedJobs?.some(
      (id) => id.toString() === jobId
    );

    if (alreadySaved) {
      // Remove from saved jobs
      user.savedJobs = user.savedJobs.filter(
        (id) => id.toString() !== jobId
      );
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Job removed from saved list",
        data: { isSaved: false },
      });
    } else {
      // Add to saved jobs
      if (!user.savedJobs) user.savedJobs = [];
      user.savedJobs.push(jobId);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Job saved successfully",
        data: { isSaved: true },
      });
    }
  } catch (error) {
    console.error("Save job error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to save job" 
    });
  }
};

// @desc    Get saved jobs for current user
// @route   GET /api/jobs/saved
// @access  Private (User only)
const getSavedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const user = await User.findById(req.user._id)
      .select("savedJobs")
      .lean();

    if (!user || !user.savedJobs || user.savedJobs.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          savedJobs: [],
          pagination: {
            total: 0,
            totalPages: 0,
            currentPage: pageNum,
            perPage: limitNum
          }
        }
      });
    }

    // Get total count
    const totalSaved = user.savedJobs.length;
    const totalPages = Math.ceil(totalSaved / limitNum);

    // Get paginated saved jobs
    const savedJobs = await Job.find({
      _id: { $in: user.savedJobs },
      isActive: true
    })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("employer", "name companyName companyLocation companyLogo")
      .lean();

    // Check which ones user has applied to
    const appliedJobs = await Application.find({
      applicant: req.user._id,
      job: { $in: savedJobs.map(j => j._id) }
    }).select('job status').lean();

    const appliedMap = appliedJobs.reduce((map, app) => {
      map[app.job.toString()] = app.status;
      return map;
    }, {});

    savedJobs.forEach(job => {
      job.hasApplied = !!appliedMap[job._id.toString()];
      job.applicationStatus = appliedMap[job._id.toString()] || null;
    });

    res.status(200).json({
      success: true,
      data: {
        savedJobs,
        pagination: {
          total: totalSaved,
          totalPages,
          currentPage: pageNum,
          perPage: limitNum,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error("Get saved jobs error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch saved jobs" 
    });
  }
};

// @desc    Check if user has applied to a job
// @route   GET /api/jobs/:id/check-application
// @access  Private
const checkApplicationStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid job ID" 
      });
    }

    const application = await Application.findOne({
      job: jobId,
      applicant: userId,
    }).select('status createdAt').lean();

    res.status(200).json({
      success: true,
      data: {
        hasApplied: !!application,
        application: application ? {
          status: application.status,
          appliedAt: application.createdAt,
        } : null,
      }
    });
  } catch (error) {
    console.error("Check application status error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to check application status" 
    });
  }
};

// @desc    Get similar jobs based on current job
// @route   GET /api/jobs/:id/similar
// @access  Public
const getSimilarJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid job ID format" 
      });
    }

    const currentJob = await Job.findById(id).lean();
    if (!currentJob) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    // Extract keywords from title (words longer than 3 characters)
    const keywords = currentJob.title
      .split(' ')
      .filter(word => word.length > 3)
      .map(word => word.replace(/[^\w]/g, ''));

    // Build search criteria
    const searchCriteria = [];
    
    // Match by job type
    if (currentJob.jobType) {
      searchCriteria.push({ jobType: currentJob.jobType });
    }
    
    // Match by location (first part of location)
    if (currentJob.location) {
      const locationPart = currentJob.location.split(',')[0].trim();
      if (locationPart.length > 2) {
        searchCriteria.push({ 
          location: { $regex: locationPart, $options: 'i' } 
        });
      }
    }
    
    // Match by keywords in title
    if (keywords.length > 0) {
      searchCriteria.push({
        $or: keywords.map(keyword => ({
          title: { $regex: keyword, $options: 'i' }
        }))
      });
    }

    // Find similar jobs
    const similarJobs = await Job.find({
      _id: { $ne: id },
      isActive: true,
      $or: searchCriteria.length > 0 ? searchCriteria : [{ isActive: true }]
    })
      .populate("employer", "name companyName companyLogo")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: {
        similarJobs,
        count: similarJobs.length
      }
    });
  } catch (error) {
    console.error("Get similar jobs error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch similar jobs" 
    });
  }
};

// @desc    Get job statistics for admin
// @route   GET /api/jobs/stats
// @access  Private (Admin only)
// @desc    Get job statistics for homepage (public)
// @route   GET /api/jobs/stats/overview
// @access  Public
const getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ isActive: true });
    
    const jobsByType = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$jobType", count: { $sum: 1 } } }
    ]);

    const recentJobs = await Job.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("employer", "companyName")
      .select("title location jobType salary createdAt")
      .lean();

    // Format jobs by type
    const jobsByTypeMap = {
      "Full-time": 0,
      "Part-time": 0,
      "Internship": 0,
      "Contract": 0,
      "Remote": 0
    };
    
    jobsByType.forEach(item => {
      jobsByTypeMap[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalJobs,
        active: totalJobs,
        jobsByType: jobsByTypeMap,
        recentJobs
      }
    });
  } catch (error) {
    console.error("Get job stats overview error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch job statistics" 
    });
  }
};
// @desc    Toggle job active/inactive status
// @route   PATCH /api/jobs/:id/toggle-status
// @access  Private (Employer only)

const toggleJobStatus = async (req, res) => {
  try {
    const employerId = req.user._id;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // check ownership
    if (job.employer.toString() !== employerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job"
      });
    }

    // toggle status
    job.isActive = !job.isActive;

    await job.save();

    res.status(200).json({
      success: true,
      message: job.isActive
        ? "Job activated successfully"
        : "Job deactivated successfully",
      job
    });

  } catch (error) {
    console.error("Toggle job status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update job status"
    });
  }
};
const getFeaturedJobs = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 3;

    const jobs = await Job.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getJobStatsOverview = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: "active" });

    res.json({
      totalJobs,
      activeJobs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getAllJobs,
  getSingleJob,
  applyForJob,
  viewAppliedJobs,
  postJob,
  updateJob,
  deleteJob,
  getMyPostedJobs,
  viewApplicants,
  changeApplicationStatus,
  employerDashboardStats,
  saveJob,
  getSavedJobs,
  checkApplicationStatus,
  getSimilarJobs,
  getJobStats,
  toggleJobStatus,
  getFeaturedJobs,
  getJobStatsOverview
};