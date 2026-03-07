import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    recentJobs: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    const { data } = await axios.get("/jobs/employer/stats");

    console.log("Stats response:", data);

    if (data.success) {
      const overview = data.data.overview;

      setStats({
        totalJobs: overview.totalJobs,
        activeJobs: overview.activeJobs,
        totalApplications: overview.totalApplications,
        recentJobs: []
      });
    }

    setLoading(false);

  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    toast.error("Failed to load dashboard data");
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Employer Dashboard 🏢
            </h1>
            <p className="text-gray-400">
              Manage your jobs and view applications
            </p>
          </div>
          
          <Link
            to="/post-job"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition text-white font-semibold"
          >
            + Post New Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-gray-400 text-sm">Total Jobs</h3>
            <p className="text-3xl font-bold text-white">{stats.totalJobs}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="text-3xl mb-2">✅</div>
            <h3 className="text-gray-400 text-sm">Active Jobs</h3>
            <p className="text-3xl font-bold text-green-400">{stats.activeJobs}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="text-3xl mb-2">👥</div>
            <h3 className="text-gray-400 text-sm">Total Applications</h3>
            <p className="text-3xl font-bold text-indigo-400">{stats.totalApplications}</p>
          </motion.div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Jobs</h2>
          
          {stats.recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">You haven't posted any jobs yet</p>
              <Link
                to="/post-job"
                className="inline-block px-6 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition text-white"
              >
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentJobs.map((job) => (
                <div
                  key={job._id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{job.title}</h3>
                    <p className="text-sm text-gray-400">
                      {job.location} • {job.jobType}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 md:mt-0">
                    <span className="text-sm text-indigo-400">
                      {job.applicantCount || 0} Applications
                    </span>
                    <Link
                      to={`/view-applicants/${job._id}`}
                      className="px-4 py-2 bg-indigo-600/50 hover:bg-indigo-600 rounded-lg transition text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-4">
                <Link
                  to="/my-jobs"
                  className="text-indigo-400 hover:text-indigo-300 transition"
                >
                  View All Jobs →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;