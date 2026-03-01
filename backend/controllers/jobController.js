const Job = require("../models/Job");
const User = require("../models/User");
const mongoose = require("mongoose");
const Application = require("../models/Application");

// @desc    Get all jobs (public)
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const { keyword, location, jobType, salary, page = 1, limit = 10 } = req.query;
    
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
    
    // Filter by salary range (if needed)
    if (salary) {
      // Assuming salary is stored as string like "50k-80k" or "50000-80000"
      // This is simplified - you might want to store numeric min/max instead
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get jobs with pagination
    const jobs = await Job.find(filter)
      .populate("employer", "name email companyName companyLocation")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limitNum);

    res.status(200).json({
      success: true,
      totalJobs,
      totalPages,
      currentPage: pageNum,
      jobsPerPage: limitNum,
      jobs,
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
      .populate("employer", "name email companyName companyLocation companyWebsite")
      .lean();

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    // Increment view count (if you have this field)
    await Job.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error("Get single job error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch job" 
    });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (User only)
const applyForJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;

    // Check if user is a job seeker
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only job seekers can apply for jobs",
      });
    }

    // Validate job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid job ID" 
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

    // Check if job is active
    if (!job.isActive) {
      return res.status(400).json({ 
        success: false,
        message: "This job is no longer active" 
      });
    }

    // Check if user has uploaded resume
    const user = await User.findById(userId);
    if (!user.resume) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume before applying",
      });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Verify employer exists
    if (!job.employer) {
      return res.status(400).json({ 
        success: false,
        message: "Job has no associated employer" 
      });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: userId,
      employer: job.employer,
      status: "Pending",
      resume: user.resume, // Include resume path
    });

    res.status(201).json({
      success: true,
      message: "Job applied successfully",
      application: {
        _id: application._id,
        status: application.status,
        appliedAt: application.createdAt,
      },
    });
  } catch (error) {
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
        select: "title location salary jobType description createdAt",
        populate: {
          path: "employer",
          select: "name companyName companyLocation"
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
      totalApplications,
      totalPages,
      currentPage: pageNum,
      applications,
    });
  } catch (error) {
    console.error("View applied jobs error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch applied jobs" 
    });
  }
};

// @desc    Post a new job (Employer only)
// @route   POST /api/jobs
// @access  Private (Employer only)
const postJob = async (req, res) => {
  try {
    const employerId = req.user._id;

    // Check if employer is approved
    if (!req.user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your employer account is pending admin approval. You cannot post jobs yet.",
      });
    }

    const { title, description, location, salary, jobType, requirements, responsibilities, benefits, experienceLevel, applicationDeadline } = req.body;

    // Validation
    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and location are required",
      });
    }

    // Create job
    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      salary: salary?.trim(),
      jobType: jobType || "Full-time",
      employer: employerId,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      benefits: benefits || [],
      experienceLevel,
      applicationDeadline,
    });

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    console.error("Post job error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to post job" 
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
        message: "You are not authorized to update this job",
      });
    }

    // Update fields (only provided ones)
    const updatableFields = [
      'title', 'description', 'location', 'salary', 
      'jobType', 'isActive', 'requirements', 'responsibilities',
      'benefits', 'experienceLevel', 'applicationDeadline'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = field.includes('Date') ? req.body[field] : req.body[field]?.trim() || req.body[field];
      }
    });

    const updatedJob = await job.save();

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update job" 
    });
  }
};

// @desc    Delete a job (Employer only)
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only)
const deleteJob = async (req, res) => {
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
        message: "You are not authorized to delete this job",
      });
    }

    // Delete related applications first
    await Application.deleteMany({ job: jobId });

    // Delete the job
    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      message: "Job and related applications deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete job" 
    });
  }
};

// @desc    Get jobs posted by current employer
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer only)
const getMyPostedJobs = async (req, res) => {
  try {
    const employerId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get jobs with pagination
    const jobs = await Job.find({ employer: employerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get applicant counts for each job
    const jobsWithApplicantCount = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({
          job: job._id,
        });
        
        // Get status breakdown
        const statusBreakdown = await Application.aggregate([
          { $match: { job: job._id } },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        return {
          ...job,
          applicantCount,
          statusBreakdown: statusBreakdown.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {})
        };
      })
    );

    const totalJobs = await Job.countDocuments({ employer: employerId });
    const totalPages = Math.ceil(totalJobs / limitNum);

    res.status(200).json({
      success: true,
      totalJobs,
      totalPages,
      currentPage: pageNum,
      jobs: jobsWithApplicantCount,
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

    res.status(200).json({
      success: true,
      jobTitle: job.title,
      totalApplicants,
      totalPages,
      currentPage: pageNum,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      applicants: applications,
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

    // If status is "Accepted" or "Shortlisted", you might want to add interview logic
    if (status === "Accepted" || status === "Shortlisted") {
      // You could send an email notification here
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      application: {
        _id: application._id,
        status: application.status,
        job: application.job.title,
        applicant: application.applicant,
      },
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
      recentApplications
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
        .lean()
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

    res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        ...statusCounts,
        applicationRate: totalJobs > 0 
          ? Math.round((totalApplications / totalJobs) * 10) / 10 
          : 0,
      },
      recentApplications,
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

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const alreadySaved = user.savedJobs.some(
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
        isSaved: false,
      });
    } else {
      // Add to saved jobs
      user.savedJobs.push(jobId);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Job saved successfully",
        isSaved: true,
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
      .populate({
        path: "savedJobs",
        match: { isActive: true }, // Only show active jobs
        options: {
          sort: { createdAt: -1 },
          skip: (pageNum - 1) * limitNum,
          limit: limitNum,
        },
        populate: {
          path: "employer",
          select: "name companyName companyLocation"
        }
      })
      .select("savedJobs");

    // Get total count of saved jobs
    const totalSaved = await User.findById(req.user._id)
      .select("savedJobs")
      .lean();

    const totalPages = Math.ceil(totalSaved.savedJobs.length / limitNum);

    res.status(200).json({
      success: true,
      totalSaved: totalSaved.savedJobs.length,
      totalPages,
      currentPage: pageNum,
      savedJobs: user.savedJobs,
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
// @desc    Change application status
// @route   PUT /api/jobs/employer/applications/:id/status
// @access  Private (Employer only)
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
    });

    res.status(200).json({
      success: true,
      hasApplied: !!application,
      application: application ? {
        _id: application._id,
        status: application.status,
        appliedAt: application.createdAt,
      } : null,
    });
  } catch (error) {
    console.error("Check application status error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to check application status" 
    });
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
};