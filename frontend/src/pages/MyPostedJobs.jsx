import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const MyPostedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0
  });

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/jobs/employer/jobs"); // Updated endpoint

      // Handle response structure from your backend
      if (data.success) {
        setJobs(data.jobs || []);
        setStats({
          totalJobs: data.totalJobs || 0,
          activeJobs: data.jobs?.filter(job => job.isActive).length || 0,
          totalApplications: data.jobs?.reduce((acc, job) => acc + (job.applicantCount || 0), 0) || 0
        });
      } else {
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load your jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const { data } = await axios.patch(`/jobs/${jobId}/toggle-status`);
      
      if (data.success) {
        toast.success(data.message);
        // Update local state
        setJobs(jobs.map(job => 
          job._id === jobId 
            ? { ...job, isActive: !currentStatus }
            : job
        ));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update job status");
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      try {
        const { data } = await axios.delete(`/jobs/${jobId}`);
        
        if (data.success) {
          toast.success(data.message);
          // Remove job from list
          setJobs(jobs.filter(job => job._id !== jobId));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete job");
      }
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? "bg-green-500/20 text-green-400 border-green-500/30" 
      : "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 md:px-8 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your jobs...</p>
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
              My <span className="text-indigo-400">Posted Jobs</span>
            </h1>
            <p className="text-gray-400">
              Manage your job postings and track applications
            </p>
          </div>

          {/* Quick Stats */}
          {jobs.length > 0 && (
            <div className="flex gap-4 mt-4 md:mt-0">
              <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20">
                <span className="text-indigo-400 font-bold">{stats.totalJobs}</span>
                <span className="text-gray-400 text-sm ml-2">Total</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20">
                <span className="text-green-400 font-bold">{stats.activeJobs}</span>
                <span className="text-gray-400 text-sm ml-2">Active</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20">
                <span className="text-purple-400 font-bold">{stats.totalApplications}</span>
                <span className="text-gray-400 text-sm ml-2">Applications</span>
              </div>
            </div>
          )}
        </div>

        {/* Post New Job Button */}
        <div className="mb-8">
          <Link
            to="/post-job"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
          >
            <span>➕</span>
            Post New Job
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
              No Jobs Posted Yet
            </h2>
            <p className="text-gray-400 mb-8">
              Start posting jobs to attract top talent!
            </p>
            <Link
              to="/post-job"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
            >
              Post Your First Job
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {jobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Job Card */}
                <div className="p-6">
                  {/* Header with Status */}
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-indigo-300 line-clamp-1 flex-1">
                      {job.title}
                    </h2>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.isActive)}`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <p className="flex items-center gap-2">
                      <span>📍</span>
                      {job.location || "Location not specified"}
                    </p>
                    
                    {job.jobType && (
                      <p className="flex items-center gap-2">
                        <span>💼</span>
                        {job.jobType}
                      </p>
                    )}
                    
                    {job.salary && (
                      <p className="flex items-center gap-2">
                        <span>💰</span>
                        {job.salary}
                      </p>
                    )}

                    {/* Applicant Count */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                      <span className="text-indigo-400 font-semibold">
                        {job.applicantCount || 0}
                      </span>
                      <span className="text-gray-400">
                        {job.applicantCount === 1 ? 'Applicant' : 'Applicants'}
                      </span>
                    </div>
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Link
                      to={`/view-applicants/${job._id}`}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 text-center"
                    >
                      View Applicants ({job.applicantCount || 0})
                    </Link>

                    <div className="flex gap-2">
                      <Link
                        to={`/edit-job/${job._id}`}
                        className="flex-1 bg-purple-600/50 hover:bg-purple-600 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 text-center"
                      >
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => handleToggleStatus(job._id, job.isActive)}
                        className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                          ${job.isActive 
                            ? 'bg-yellow-600/50 hover:bg-yellow-600' 
                            : 'bg-green-600/50 hover:bg-green-600'
                          }`}
                      >
                        {job.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="flex-1 bg-red-600/50 hover:bg-red-600 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer with Date */}
                <div className="bg-white/5 px-6 py-3 text-xs text-gray-500 border-t border-white/10">
                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Status Breakdown (if jobs exist) */}
        {jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="bg-indigo-500 w-1 h-5 rounded-full mr-3"></span>
              Status Breakdown
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">
                  {jobs.length}
                </div>
                <div className="text-xs text-gray-400">Total Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {jobs.filter(j => j.isActive).length}
                </div>
                <div className="text-xs text-gray-400">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {jobs.filter(j => !j.isActive).length}
                </div>
                <div className="text-xs text-gray-400">Inactive Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {jobs.reduce((acc, job) => acc + (job.applicantCount || 0), 0)}
                </div>
                <div className="text-xs text-gray-400">Total Applications</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MyPostedJobs;