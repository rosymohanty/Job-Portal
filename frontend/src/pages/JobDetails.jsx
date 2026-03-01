import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
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
  }, []);

  // Check if user has already applied and if job is saved
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (user?.role === "user" && job) {
        try {
          const { data } = await axios.get(`/jobs/${id}/application-status`);
          if (data.success) {
            setHasApplied(data.hasApplied);
          }
        } catch (error) {
          console.error("Error checking application status:", error);
        }
      }
    };

    const checkSavedStatus = () => {
      if (user?.savedJobs) {
        setIsSaved(user.savedJobs.includes(id));
      }
    };

    checkApplicationStatus();
    checkSavedStatus();
  }, [id, user, job]);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/jobs/${id}`);
        
        // Handle the response structure from your backend
        if (data.success) {
          setJob(data.job);
        } else {
          setJob(data); // Fallback for older response format
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Handle job application
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

    try {
      setApplying(true);
      const { data } = await axios.post(`/jobs/${id}/apply`);

      if (data.success) {
        toast.success(data.message || "Job applied successfully!");
        setHasApplied(true);
      } else {
        toast.error(data.message || "Failed to apply");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setApplying(false);
    }
  };

  // Handle save/unsave job
  const handleSaveJob = async () => {
    if (!user) {
      toast.error("Please login to save jobs");
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      toast.error("Only job seekers can save jobs");
      return;
    }

    try {
      const { data } = await axios.post(`/jobs/${id}/save`);
      
      if (data.success) {
        setIsSaved(!isSaved);
        toast.success(data.message);
        
        // Update savedJobs in localStorage
        const updatedUser = { ...user };
        if (!isSaved) {
          // Add to saved jobs
          updatedUser.savedJobs = [...(user.savedJobs || []), id];
        } else {
          // Remove from saved jobs
          updatedUser.savedJobs = (user.savedJobs || []).filter(
            (jobId) => jobId !== id
          );
        }
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save job");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">Job Not Found</h2>
          <p className="text-gray-500 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/jobs")}
            className="bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 md:px-6 pb-12 text-white">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <span>←</span> Back to Jobs
        </button>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ rotateY: 2, rotateX: 2 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 md:p-10"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Job Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-2">
                {job.title}
              </h1>
              
              <div className="flex items-center gap-4 text-gray-300">
                <span className="flex items-center gap-1">
                  🏢 {job.employer?.companyName || job.employer?.name || "Company"}
                </span>
                {job.jobType && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm">
                      {job.jobType}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Save Button for Job Seekers */}
            {user?.role === "user" && (
              <button
                onClick={handleSaveJob}
                className={`mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isSaved 
                    ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" 
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                <span>{isSaved ? "★" : "☆"}</span>
                <span>{isSaved ? "Saved" : "Save Job"}</span>
              </button>
            )}
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {job.location && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">📍 Location</p>
                <p className="text-lg font-medium">{job.location}</p>
              </div>
            )}
            
            {job.salary && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">💰 Salary</p>
                <p className="text-lg font-medium">{job.salary}</p>
              </div>
            )}

            {job.experienceLevel && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">📊 Experience Level</p>
                <p className="text-lg font-medium">{job.experienceLevel}</p>
              </div>
            )}

            {job.applicationDeadline && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">⏰ Apply Before</p>
                <p className="text-lg font-medium">
                  {new Date(job.applicationDeadline).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-indigo-500 w-1 h-6 rounded-full mr-3"></span>
              Job Description
            </h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="bg-indigo-500 w-1 h-6 rounded-full mr-3"></span>
                Requirements
              </h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="bg-indigo-500 w-1 h-6 rounded-full mr-3"></span>
                Responsibilities
              </h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                {job.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="bg-indigo-500 w-1 h-6 rounded-full mr-3"></span>
                Benefits
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Company Info */}
          {job.employer && (
            <div className="mb-8 p-6 bg-white/5 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">About the Company</h2>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="text-gray-400">Company:</span> {job.employer.companyName || job.employer.name}
                </p>
                {job.employer.companyWebsite && (
                  <p className="text-gray-300">
                    <span className="text-gray-400">Website:</span>{" "}
                    <a
                      href={job.employer.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline"
                    >
                      {job.employer.companyWebsite}
                    </a>
                  </p>
                )}
                {job.employer.companyLocation && (
                  <p className="text-gray-300">
                    <span className="text-gray-400">Location:</span> {job.employer.companyLocation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            {user?.role === "user" && (
              <>
                {hasApplied ? (
                  <div className="flex-1 bg-green-500/20 border border-green-500/30 px-6 py-3 rounded-2xl text-center">
                    <p className="text-green-400 font-semibold">
                      ✅ You have already applied for this job
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? "Applying..." : "Apply Now"}
                  </button>
                )}
              </>
            )}

            {!user && (
              <div className="flex-1 bg-white/5 rounded-2xl p-6 text-center">
                <p className="text-gray-400 mb-4">Please login to apply for this job</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-indigo-600 px-6 py-2 rounded-xl hover:bg-indigo-700 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="bg-purple-600 px-6 py-2 rounded-xl hover:bg-purple-700 transition"
                  >
                    Register
                  </button>
                </div>
              </div>
            )}

            {user?.role === "employer" && user?._id === job.employer?._id && (
              <div className="flex-1 flex gap-4">
                <button
                  onClick={() => navigate(`/edit-job/${job._id}`)}
                  className="flex-1 bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
                >
                  Edit Job
                </button>
                <button
                  onClick={() => navigate(`/job/${job._id}/applicants`)}
                  className="flex-1 bg-purple-600 px-6 py-3 rounded-xl hover:bg-purple-700 transition"
                >
                  View Applicants
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetails;