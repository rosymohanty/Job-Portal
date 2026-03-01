import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const steps = [
  "Pending",
  "Reviewed",
  "Shortlisted",
  "Accepted",
  "Rejected"
];

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Fix 1: Correct API endpoint (matches your routes)
      const { data } = await axios.get("/jobs/applied/me");
      
      // Handle both response formats
      if (data.success) {
        setApplications(data.applications || []);
        // Calculate stats
        const apps = data.applications || [];
        calculateStats(apps);
      } else {
        setApplications(data.applications || []);
        calculateStats(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps) => {
    const newStats = {
      total: apps.length,
      pending: apps.filter(app => app.status === "Pending").length,
      reviewed: apps.filter(app => app.status === "Reviewed").length,
      shortlisted: apps.filter(app => app.status === "Shortlisted").length,
      accepted: apps.filter(app => app.status === "Accepted").length,
      rejected: apps.filter(app => app.status === "Rejected").length
    };
    setStats(newStats);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Reviewed":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Shortlisted":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Pending":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return "🎉";
      case "Rejected":
        return "❌";
      case "Reviewed":
        return "👀";
      case "Shortlisted":
        return "⭐";
      case "Pending":
        return "⏳";
      default:
        return "📝";
    }
  };

  const getStatusIndex = (status) => {
    const index = steps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  const toggleTimeline = (applicationId) => {
    if (selectedId === applicationId) {
      setSelectedId(null);
    } else {
      setSelectedId(applicationId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 md:px-8 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your applications...</p>
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            My <span className="text-indigo-400">Applications</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Track the status of all your job applications
          </p>
        </div>

        {/* Stats Cards */}
        {applications.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-indigo-400">{stats.total}</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-blue-400">{stats.reviewed}</p>
              <p className="text-xs text-gray-400">Reviewed</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-purple-400">{stats.shortlisted}</p>
              <p className="text-xs text-gray-400">Shortlisted</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
              <p className="text-xs text-gray-400">Accepted</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
              <p className="text-xs text-gray-400">Rejected</p>
            </div>
          </div>
        )}

        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10"
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-300 mb-4">
              No Applications Yet
            </h2>
            <p className="text-gray-400 mb-8">
              You haven't applied for any jobs. Start exploring and apply today!
            </p>
            <Link
              to="/jobs"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
            >
              Browse Jobs
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {applications.map((app, index) => {
              const currentStepIndex = getStatusIndex(app.status);
              const isExpanded = selectedId === app._id;
              
              return (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-indigo-300 mb-2">
                          {app.job?.title || "Job Title"}
                        </h2>
                        
                        {/* Fix 2: Access employer name correctly from populated data */}
                        <p className="text-gray-300 flex items-center gap-2">
                          <span>🏢</span>
                          {app.job?.employer?.companyName || 
                           app.job?.employer?.name || 
                           "Company Name"}
                        </p>
                      </div>
                      
                      <span className="text-3xl opacity-50">
                        {getStatusIcon(app.status)}
                      </span>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      <p className="flex items-center gap-2">
                        <span>📍</span>
                        {app.job?.location || "Location not specified"}
                      </p>
                      {app.job?.salary && (
                        <p className="flex items-center gap-2">
                          <span>💰</span>
                          {app.job.salary}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <span>📅</span>
                        Applied: {formatDate(app.createdAt || app.appliedAt)}
                      </p>
                    </div>

                    {/* Status Badge and Action Button */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status || "Pending"}
                      </span>

                      <button
                        onClick={() => toggleTimeline(app._id)}
                        className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2"
                      >
                        <span>{isExpanded ? "Hide" : "View"} Progress</span>
                        <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Timeline Section - Fix 3: Use current status to show progress */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10 bg-white/5 p-6"
                    >
                      <h3 className="text-sm font-semibold text-gray-400 mb-4">
                        APPLICATION PROGRESS
                      </h3>
                      
                      <div className="space-y-4">
                        {steps.map((step, idx) => {
                          const isCompleted = idx <= currentStepIndex && app.status !== "Rejected";
                          const isCurrentStep = idx === currentStepIndex;
                          const isRejected = app.status === "Rejected";

                          return (
                            <div key={idx} className="flex items-start gap-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                                  ${
                                    isRejected && idx === steps.length - 1
                                      ? "bg-red-500 text-white"
                                      : isCompleted
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-700 text-gray-400"
                                  }`}
                              >
                                {isRejected && idx === steps.length - 1 
                                  ? "✕" 
                                  : isCompleted 
                                  ? "✓" 
                                  : idx + 1}
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p
                                    className={`font-medium ${
                                      isRejected && idx === steps.length - 1
                                        ? "text-red-400"
                                        : isCompleted
                                        ? "text-green-400"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {step}
                                  </p>
                                  
                                  {isCurrentStep && !isRejected && (
                                    <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full">
                                      Current
                                    </span>
                                  )}
                                </div>

                                {isRejected && step === "Rejected" && (
                                  <p className="text-xs text-red-400 mt-1">
                                    Your application was not selected for this position
                                  </p>
                                )}

                                {/* Progress bar for visual representation */}
                                {idx < steps.length - 1 && (
                                  <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-500 ${
                                        isRejected && idx === steps.length - 2
                                          ? "bg-red-500"
                                          : isCompleted
                                          ? "bg-green-500"
                                          : "bg-gray-600"
                                      }`}
                                      style={{
                                        width: isCompleted ? "100%" : "0%"
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* View Job Details Link */}
                      <Link
                        to={`/jobs/${app.job?._id}`}
                        className="mt-6 inline-block text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                      >
                        View Job Details →
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyApplications;