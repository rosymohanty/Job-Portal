const Job=require("../models/Job");
const User=require("../models/User");
const mongoose=require("mongoose");
const Application=require("../models/Application");
// GET ALL JOBS 
const getAllJobs = async (req, res) => {
  try {
    const { keyword, location } = req.query;
    let filter = { isActive: true };
    if (keyword && typeof keyword === "string") {
      filter.title = { $regex: keyword.trim(), $options: "i" };
    }
    if (location && typeof location === "string") {
      filter.location = { $regex: location.trim(), $options: "i" };
    }
    const jobs = await Job.find(filter)
      .populate("employer", "name email role")
      .sort({ createdAt: -1 });
    res.status(200).json({
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET SINGLE JOB 
const getSingleJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Job ID format" });
    }
    const job = await Job.findById(id)
      .populate("employer", "name email role");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
// APPLY FOR JOB
const applyForJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Job not found or inactive" });
    }

    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        message: "You have already applied for this job",
      });
    }

    const application = await Application.create({
      job: jobId,
      applicant: userId,
      employer: job.employer,
    });

    res.status(201).json({
      success: true,
      message: "Job applied successfully",
      application,
    });
  } catch (error) {
    console.error("Apply Error:", error);
    res.status(500).json({ message: error.message });
  }
};
//VIEW APPLIED JOBS
const viewAppliedJobs = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user._id
    })
      .populate({
        path: "job",
        select: "title location salary jobType",
        populate: {
          path: "employer",
          select: "name email role"
        }
      })
      .sort({ createdAt: -1 });
    res.status(200).json({
      totalAppliedJobs: applications.length,
      applications
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// POST JOB(EMPLOYER)
const postJob=async(req,res)=>{
  try{
    const employerId=req.user._id;
    if(!req.user.isApproved){
      return res.status(403).json({
        message:"Employer not approved by Admin"
      });
    }
    const {title,description,location,salary,jobType}=req.body;
    if(!title||!description||!location){
      return res.status(400).json({
        message:"Title, description, and location are required",
      });
    }
    const job=await Job.create({
      title,
      description,
      location,
      salary,
      jobType,
      employer:employerId
    });
    res.status(201).json({
      message:"Job posted successfully",
      job
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// UPDATE JOB (EMPLOYER)
const updateJob=async(req,res)=>{
  try{
    const employerId=req.user._id;
    const jobId=req.params.id;
    const job=await Job.findById(jobId);
    if(!job){
      return res.status(404).json({message:"Job not found"});
    }
    if(job.employer.toString()!==employerId.toString()){
      return res.status(403).json({
        message:"You are not authorized to update this job"
      });
    }
    const {title,description,location,salary,jobType,isActive}=req.body;
    if(title)job.title=title;
    if(description)job.description=description;
    if(location)job.location=location;
    if(salary)job.salary=salary;
    if(jobType)job.jobType=jobType;
    if(typeof isActive!=="undefined")job.isActive=isActive;
    const updatedJob=await job.save();
    res.status(200).json({
      message:"Job updated sucessfully",
      job:updatedJob
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// DELETE JOB 
const deleteJob=async(req,res)=>{
  try{
    const employerId=req.user._id;
    const jobId=req.params.id;
    const job=await Job.findById(jobId);
    if(!job){
      return res.status(404).json({message:"Job not found"});
    }
    if(job.employer.toString()!==employerId.toString()){
      return res.status(403).json({
        message:"You are not authorized to delete this job",
      });
    }
    await Application.deleteMany({job:jobId});
    await Job.findByIdAndDelete(jobId);
    res.status(200).json({
      message:"Job and related applications deleted successfully",
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// GET MY POSTED JOBS
const getMyPostedJobs=async(req,res)=>{
  try{
    const employerId=req.user._id;

    const jobs=await Job.find({employer:employerId})
      .sort({createdAt:-1});
      const jobsWithApplicantCount=await Promise.all(
        jobs.map(async(job)=>{
          const applicantCount=await Application.countDocuments({
            job:job._id,
          });
          return {
            ...job.toObject(),
            applicantCount
          };
        })
      );
      res.status(200).json({
        totalJobs:jobs.length,
        jobs:jobsWithApplicantCount
      });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// VIEW APPLICANTS 
const viewApplicants=async(req,res)=>{
  try{
    const employerId=req.user._id;
    const jobId=req.params.id;
    const job=await Job.findById(jobId);
    if(!job){
      return res.status(404).json({message:"Job not found"});
    }
    if(job.employer.toString()!==employerId.toString()){
      return res.status(403).json({
        message:"You are not authorized to view applicants for this job"
      });
    }
    const applications=await Application.find({job:jobId})
      .populate({
        path:"applicant",
        select:"name email phone bio skills resume"
      })
      .sort({createdAt:-1});
    res.status(200).json({
      totalApplicants:applications.length,
      jobTitle:job.title,
      applicants:applications
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};
// CHANGE APPLICATION STATUS
const changeApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;
    const employerId = req.user._id;

    const validStatuses = [
      "Pending",
      "Reviewed",
      "Shortlisted",
      "Accepted",
      "Rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const application = await Application.findById(applicationId).populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.employer.toString() !== employerId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this application",
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Status Change Error:", error);
    res.status(500).json({ message: error.message });
  }
};
// EMPLOYER DASHBOARD STATS
const employerDashboardStats = async (req, res) => {
  try {
    const employerId = req.user._id;

    // 1️⃣ Total Jobs Posted
    const totalJobs = await Job.countDocuments({
      employer: employerId,
    });

    // 2️⃣ Total Active Jobs
    const activeJobs = await Job.countDocuments({
      employer: employerId,
      isActive: true,
    });

    // Get employer job IDs
    const employerJobs = await Job.find({ employer: employerId }).select("_id");

    const jobIds = employerJobs.map((job) => job._id);

    // 3️⃣ Total Applications
    const totalApplications = await Application.countDocuments({
      job: { $in: jobIds },
    });

    // 4️⃣ Accepted Candidates
    const acceptedApplications = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
    });

    // 5️⃣ Rejected Candidates
    const rejectedApplications = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Rejected",
    });

    res.status(200).json({
      totalJobs,
      activeJobs,
      totalApplications,
      acceptedApplications,
      rejectedApplications,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// SAVE JOB
const saveJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadySaved = user.savedJobs.some(
      (id) => id.toString() === jobId
    );

    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter(
        (id) => id.toString() !== jobId
      );
      await user.save();

      return res.status(200).json({
        message: "Job removed from saved list",
      });
    } else {
      user.savedJobs.push(jobId);
      await user.save();

      return res.status(200).json({
        message: "Job saved successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("savedJobs")
      .select("savedJobs");

    res.status(200).json({
      totalSaved: user.savedJobs.length,
      savedJobs: user.savedJobs,
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
  getSavedJobs
};