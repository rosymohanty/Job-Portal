import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ViewApplicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchApplicants();
  }, [id]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/jobs/employer/jobs/${id}/applicants`);
      
      // Handle response structure from your backend
      if (data.success) {
        setApplicants(data.applicants || []);
        setJobTitle(data.jobTitle || "");
        
        // Calculate stats
        const apps = data.applicants || [];
        setStats({
          total: data.totalApplicants || apps.length,
          pending: apps.filter(app => app.status === "Pending").length,
          reviewed: apps.filter(app => app.status === "Reviewed").length,
          shortlisted: apps.filter(app => app.status === "Shortlisted").length,
          accepted: apps.filter(app => app.status === "Accepted").length,
          rejected: apps.filter(app => app.status === "Rejected").length
        });
      } else {
        setApplicants(data.applicants || []);
        setJobTitle(data.jobTitle || "");
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      
      const response = await axios.put(
        `/jobs/employer/applications/${applicationId}/status`,
        { 
          status: newStatus
        }
      );

      if (response.data.success) {
        // Update local state
        setApplicants(prev => 
          prev.map(app => 
            app._id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        );

        // Update stats
        const updatedApps = applicants.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        );
        
        setStats({
          total: updatedApps.length,
          pending: updatedApps.filter(app => app.status === "Pending").length,
          reviewed: updatedApps.filter(app => app.status === "Reviewed").length,
          shortlisted: updatedApps.filter(app => app.status === "Shortlisted").length,
          accepted: updatedApps.filter(app => app.status === "Accepted").length,
          rejected: updatedApps.filter(app => app.status === "Rejected").length
        });

        toast.success(`Status updated to ${newStatus}`);
      }
      
    } catch (error) {
      console.error("Status update error:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to update status";
      toast.error(errorMessage);
      
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadResume = (resumeUrl) => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    } else {
      toast.error("No resume available");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Reviewed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Shortlisted":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Pending":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Accepted": return "✅";
      case "Rejected": return "❌";
      case "Reviewed": return "👀";
      case "Shortlisted": return "⭐";
      case "Pending": return "⏳";
      default: return "📝";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading applicants...</p>
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
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <span>←</span> Back to Jobs
        </button>

        {/* Header with Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Applicants for{" "}
              <span className="text-indigo-400">{jobTitle || "Job"}</span>
            </h1>
            <p className="text-gray-400">
              {stats.total} {stats.total === 1 ? 'applicant' : 'applicants'} found
            </p>
          </div>

          {/* Stats Cards */}
          {stats.total > 0 && (
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <div className="bg-white/10 px-3 py-2 rounded-xl text-sm">
                <span className="text-yellow-400 font-bold">{stats.pending}</span>
                <span className="text-gray-400 ml-1">Pending</span>
              </div>
              <div className="bg-white/10 px-3 py-2 rounded-xl text-sm">
                <span className="text-blue-400 font-bold">{stats.reviewed}</span>
                <span className="text-gray-400 ml-1">Reviewed</span>
              </div>
              <div className="bg-white/10 px-3 py-2 rounded-xl text-sm">
                <span className="text-purple-400 font-bold">{stats.shortlisted}</span>
                <span className="text-gray-400 ml-1">Shortlisted</span>
              </div>
              <div className="bg-white/10 px-3 py-2 rounded-xl text-sm">
                <span className="text-green-400 font-bold">{stats.accepted}</span>
                <span className="text-gray-400 ml-1">Accepted</span>
              </div>
              <div className="bg-white/10 px-3 py-2 rounded-xl text-sm">
                <span className="text-red-400 font-bold">{stats.rejected}</span>
                <span className="text-gray-400 ml-1">Rejected</span>
              </div>
            </div>
          )}
        </div>

        {applicants.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10"
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-300 mb-4">
              No Applicants Yet
            </h2>
            <p className="text-gray-400 mb-8">
              Your job posting hasn't received any applications yet.
            </p>
            <button
              onClick={() => navigate("/employer/jobs")}
              className="bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
            >
              Back to My Jobs
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicants.map((application, index) => (
              <motion.div
                key={application._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`bg-white/10 backdrop-blur-xl border ${
                  application.status === "Shortlisted"
                    ? "border-yellow-500/50 ring-1 ring-yellow-500/50"
                    : application.status === "Accepted"
                    ? "border-green-500/50"
                    : "border-white/20"
                } rounded-3xl shadow-2xl overflow-hidden`}
              >
                {/* Card Header */}
                <div className="p-6">
                  {/* Applicant Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-indigo-300 mb-1">
                        {application.applicant?.name || "Unknown Applicant"}
                      </h2>
                      <p className="text-sm text-gray-400">
                        Applied {new Date(application.createdAt || application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-3xl opacity-50">
                      {getStatusIcon(application.status)}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm text-gray-300 mb-4">
                    <p className="flex items-center gap-2">
                      <span>📧</span>
                      <a href={`mailto:${application.applicant?.email}`} className="hover:text-indigo-400">
                        {application.applicant?.email || "No email"}
                      </a>
                    </p>

                    {application.applicant?.phone && (
                      <p className="flex items-center gap-2">
                        <span>📱</span>
                        <a href={`tel:${application.applicant.phone}`} className="hover:text-indigo-400">
                          {application.applicant.phone}
                        </a>
                      </p>
                    )}

                    {application.applicant?.skills && (
                      <p className="flex items-start gap-2">
                        <span>💼</span>
                        <span className="text-gray-400">
                          {Array.isArray(application.applicant.skills) 
                            ? application.applicant.skills.join(', ')
                            : application.applicant.skills}
                        </span>
                      </p>
                    )}

                    {application.applicant?.bio && (
                      <p className="flex items-start gap-2 text-xs text-gray-500 mt-2">
                        <span>📝</span>
                        <span className="line-clamp-2">{application.applicant.bio}</span>
                      </p>
                    )}
                  </div>

                  {/* Resume Link */}
                  {application.resume && (
                    <button
                      onClick={() => handleDownloadResume(application.resume)}
                      className="mb-4 text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>📄</span> View Resume
                    </button>
                  )}

                  {/* Current Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)} Current: {application.status}
                    </span>
                  </div>

                  {/* Status Update Section */}
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <label className="block text-sm mb-2 text-gray-400">
                      Update Application Status
                    </label>

                    <select
                      value={application.status}
                      onChange={(e) =>
                        handleStatusChange(
                          application._id,
                          e.target.value
                        )
                      }
                      disabled={updatingId === application._id}
                      className="w-full bg-white/10 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <option value="Pending" className="bg-gray-800">⏳ Pending</option>
                      <option value="Reviewed" className="bg-gray-800">👀 Reviewed</option>
                      <option value="Shortlisted" className="bg-gray-800">⭐ Shortlisted</option>
                      <option value="Accepted" className="bg-gray-800">✅ Accepted</option>
                      <option value="Rejected" className="bg-gray-800">❌ Rejected</option>
                    </select>
                    
                    {updatingId === application._id && (
                      <p className="text-xs text-indigo-400 mt-2 flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </p>
                    )}
                  </div>

                  {/* Notes Section (if employer notes exist) */}
                  {application.notes && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Notes:</p>
                      <p className="text-sm text-gray-300">{application.notes}</p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="bg-white/5 px-6 py-3 text-xs text-gray-500 border-t border-white/10">
                  Application ID: {application._id.slice(-6)}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Export/Download Options */}
        {applicants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-end"
          >
            <button
              onClick={() => {
                // You can implement CSV export here
                toast.success("Export feature coming soon!");
              }}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              <span>📊</span>
              Export as CSV
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ViewApplicants;