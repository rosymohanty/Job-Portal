import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching job details for ID:", id);
      
      const { data } = await axios.get(`/jobs/${id}`);
      console.log("Job details response:", data);
      
      if (data.success && data.data?.job) {
        setJob(data.data.job);
        
        // Check if user has applied (if logged in)
        if (user) {
          checkApplicationStatus();
          checkIfSaved();
        }
      } else if (data.job) {
        setJob(data.job);
      } else {
        toast.error("Job not found");
        navigate("/home");
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to load job details");
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const { data } = await axios.get(`/jobs/${id}/check-application`);
      if (data.success) {
        setHasApplied(data.data?.hasApplied || false);
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const checkIfSaved = async () => {
    try {
      // Check if job is in user's saved jobs
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setIsSaved(user.savedJobs?.includes(id) || false);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };
const handleApply = async () => {
  if (!user) {
    toast.error("Please login to apply for this job");
    navigate("/login");
    return;
  }

  if (user.role !== "user") {
    toast.error("Only job seekers can apply for jobs");
    return;
  }

  // Check if user has uploaded resume
  if (!user.resume) {
    toast.error("Please upload your resume before applying");
    navigate("/upload-resume");
    return;
  }

  setApplying(true);
  try {
    console.log("Applying for job ID:", id);
    console.log("User data:", user);
    console.log("Resume path:", user.resume);
    
    const { data } = await axios.post(`/jobs/${id}/apply`);
    
    console.log("Application response:", data);
    
    if (data.success) {
      toast.success("Application submitted successfully! 🎉");
      setHasApplied(true);
    }
  } catch (error) {
    console.error("Error applying for job:", error);
    
    if (error.response) {
      console.log("Error status:", error.response.status);
      console.log("Error data:", error.response.data);
      
      const errorMsg = error.response.data?.message;
      console.log("Error message:", errorMsg);
      
      // Show the actual error message from backend
      toast.error(errorMsg || "Failed to apply for job");
      
      // Handle specific error cases
      if (errorMsg?.includes("resume")) {
        toast.error("Please upload your resume first");
        navigate("/upload-resume");
      } else if (errorMsg?.includes("already applied")) {
        setHasApplied(true);
      } else if (errorMsg?.includes("active")) {
        // Job is no longer active
      } else if (errorMsg?.includes("deadline")) {
        // Deadline passed
      }
    } else if (error.request) {
      console.log("No response received:", error.request);
      toast.error("Network error. Please check your connection.");
    } else {
      console.log("Error:", error.message);
      toast.error("An unexpected error occurred");
    }
  } finally {
    setApplying(false);
  }
};
  const handleSaveJob = async () => {
    if (!user) {
      toast.error("Please login to save jobs");
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.post(`/jobs/${id}/save`);
      
      if (data.success) {
        setIsSaved(data.data.isSaved);
        toast.success(data.message);
        
        // Update user in localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          if (!user.savedJobs) user.savedJobs = [];
          
          if (data.data.isSaved) {
            user.savedJobs.push(id);
          } else {
            user.savedJobs = user.savedJobs.filter(jobId => jobId !== id);
          }
          
          localStorage.setItem("user", JSON.stringify(user));
          setUser(user);
        }
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(error.response?.data?.message || "Failed to save job");
    }
  };

  const getJobTypeColor = (jobType) => {
    switch (jobType) {
      case "Full-time": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Part-time": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Internship": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Contract": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Remote": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950">
        <div className="text-center bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Job Not Found</h2>
          <p className="text-gray-400 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/home"
            className="inline-block bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <span>←</span> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {job.title}
              </h1>
              <div className="flex items-center gap-3 text-gray-400">
                <span>🏢 {job.employer?.companyName || job.employer?.name || "Company"}</span>
                <span>•</span>
                <span>📍 {job.location}</span>
              </div>
            </div>
            
            {job.jobType && (
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getJobTypeColor(job.jobType)}`}>
                {job.jobType}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {user && (
            <div className="flex flex-wrap gap-3 mb-8">
              {user.role === "user" && (
                <button
                  onClick={handleApply}
                  disabled={applying || hasApplied}
                  className={`px-6 py-3 rounded-xl font-semibold transition ${
                    hasApplied
                      ? "bg-green-600/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25"
                  }`}
                >
                  {applying ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Applying...
                    </span>
                  ) : hasApplied ? (
                    "✓ Applied"
                  ) : (
                    "Apply Now"
                  )}
                </button>
              )}
              
              <button
                onClick={handleSaveJob}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-semibold"
              >
                {isSaved ? "★ Saved" : "☆ Save Job"}
              </button>
            </div>
          )}

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {job.salary && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Salary</p>
                <p className="text-lg font-semibold text-indigo-400">{job.salary}</p>
              </div>
            )}
            
            {job.experienceLevel && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Experience Level</p>
                <p className="text-lg font-semibold text-white">{job.experienceLevel}</p>
              </div>
            )}
            
            {job.applicationDeadline && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Application Deadline</p>
                <p className="text-lg font-semibold text-yellow-400">
                  {new Date(job.applicationDeadline).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Posted On</p>
              <p className="text-lg font-semibold text-white">
                {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Job Description</h2>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {job.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Benefits</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply Button (Bottom) */}
          {user && user.role === "user" && !hasApplied && (
            <div className="text-center pt-6 border-t border-white/10">
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition text-lg"
              >
                {applying ? "Applying..." : "Apply for this Position"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetails;