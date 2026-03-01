import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SavedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/jobs/saved");
      
      // Handle response structure from your backend
      if (data.success) {
        setJobs(data.savedJobs || []);
        setTotalSaved(data.totalSaved || data.savedJobs?.length || 0);
      } else {
        setJobs(data.savedJobs || []);
        setTotalSaved(data.totalSaved || data.savedJobs?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast.error("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (jobId) => {
    try {
      const { data } = await axios.post(`/jobs/${jobId}/save`);
      
      if (data.success) {
        toast.success(data.message || "Job removed from saved list");
        // Remove job from state
        setJobs(jobs.filter(job => job._id !== jobId));
        setTotalSaved(prev => prev - 1);
        
        // Update user in localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          user.savedJobs = user.savedJobs?.filter(id => id !== jobId) || [];
          localStorage.setItem("user", JSON.stringify(user));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove job");
    }
  };

  const getJobTypeColor = (jobType) => {
    switch (jobType) {
      case "Full-time":
        return "bg-green-500/20 text-green-400";
      case "Part-time":
        return "bg-blue-500/20 text-blue-400";
      case "Internship":
        return "bg-purple-500/20 text-purple-400";
      case "Contract":
        return "bg-yellow-500/20 text-yellow-400";
      case "Remote":
        return "bg-indigo-500/20 text-indigo-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading saved jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 md:px-8 pb-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header with Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Saved <span className="text-indigo-400">Jobs</span>
            </h1>
            <p className="text-gray-400">
              {totalSaved} {totalSaved === 1 ? 'job' : 'jobs'} saved for later
            </p>
          </div>

          {/* Browse Jobs Button */}
          <Link
            to="/jobs"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl transition-all duration-300"
          >
            <span>🔍</span>
            Browse More Jobs
          </Link>
        </div>

        {jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10"
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-300 mb-4">
              No Saved Jobs Yet
            </h2>
            <p className="text-gray-400 mb-8">
              Start saving jobs you're interested in and they'll appear here!
            </p>
            <Link
              to="/jobs"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
            >
              Browse Jobs
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden group"
              >
                {/* Job Card */}
                <div className="p-6">
                  {/* Header with Job Type Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-indigo-300 line-clamp-1 flex-1">
                      {job.title}
                    </h2>
                    {job.jobType && (
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getJobTypeColor(job.jobType)}`}>
                        {job.jobType}
                      </span>
                    )}
                  </div>

                  {/* Company Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🏢</span>
                    <span className="text-gray-300">
                      {job.employer?.companyName || job.employer?.name || "Company"}
                    </span>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <p className="flex items-center gap-2">
                      <span>📍</span>
                      {job.location || "Location not specified"}
                    </p>
                    
                    {job.salary && (
                      <p className="flex items-center gap-2">
                        <span>💰</span>
                        {job.salary}
                      </p>
                    )}

                    {job.experienceLevel && (
                      <p className="flex items-center gap-2">
                        <span>📊</span>
                        {job.experienceLevel} Level
                      </p>
                    )}
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 text-center"
                    >
                      View Details
                    </Link>
                    
                    <button
                      onClick={() => handleRemoveSaved(job._id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-semibold transition-all duration-300"
                      title="Remove from saved"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Footer with Date */}
                <div className="bg-white/5 px-6 py-3 text-xs text-gray-500 border-t border-white/10 flex justify-between">
                  <span>
                    Saved {job.savedAt ? new Date(job.savedAt).toLocaleDateString() : 'recently'}
                  </span>
                  {job.isActive === false && (
                    <span className="text-yellow-500">⚠️ Inactive</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Tips for Job Seekers */}
        {jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="bg-indigo-500 w-1 h-5 rounded-full mr-3"></span>
              Quick Tips
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="font-medium text-sm">Apply Soon</p>
                  <p className="text-xs text-gray-400">Don't wait too long - jobs get filled quickly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-medium text-sm">Prepare Resume</p>
                  <p className="text-xs text-gray-400">Customize your resume for each job</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="font-medium text-sm">Stay Active</p>
                  <p className="text-xs text-gray-400">Check for new jobs similar to your saved ones</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SavedJobs;