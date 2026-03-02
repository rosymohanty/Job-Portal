import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  useEffect(() => {
    fetchApplications();
  }, [pagination.page]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/jobs/applied/me?page=${pagination.page}&limit=${pagination.limit}`);
      
      console.log("Applications response:", response.data);
      
      // Handle the response based on your API structure
      if (response.data.success) {
        let applicationsList = [];
        let paginationInfo = {};
        
        // Check different possible response structures
        if (response.data.data?.applications) {
          // Structure: { success: true, data: { applications: [...], pagination: {...} } }
          applicationsList = response.data.data.applications;
          paginationInfo = response.data.data.pagination || {};
        } else if (response.data.applications) {
          // Structure: { success: true, applications: [...], pagination: {...} }
          applicationsList = response.data.applications;
          paginationInfo = response.data.pagination || {};
        } else if (Array.isArray(response.data.data)) {
          // Structure: { success: true, data: [...] }
          applicationsList = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Structure: [...] (direct array)
          applicationsList = response.data;
        }
        
        console.log("Applications found:", applicationsList.length);
        setApplications(applicationsList);
        
        // Update pagination if available
        if (Object.keys(paginationInfo).length > 0) {
          setPagination({
            total: paginationInfo.total || applicationsList.length,
            page: paginationInfo.currentPage || 1,
            limit: paginationInfo.perPage || 10,
            totalPages: paginationInfo.totalPages || 1
          });
        } else {
          // If no pagination info, calculate from array length
          setPagination(prev => ({
            ...prev,
            total: applicationsList.length
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Reviewed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Shortlisted":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              My Applications 📝
            </h1>
            <p className="text-gray-400">
              Track your job applications and their status
            </p>
          </div>
          
          <Link
            to="/home"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition text-white font-semibold"
          >
            Browse More Jobs
          </Link>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center"
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Applications Yet</h2>
            <p className="text-gray-400 mb-8">
              You haven't applied for any jobs. Start exploring and apply today!
            </p>
            <Link
              to="/home"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition"
            >
              Browse Jobs
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Total Applications</p>
                <p className="text-2xl font-bold text-white">{applications.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {applications.filter(a => a.status === "Pending").length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Shortlisted</p>
                <p className="text-2xl font-bold text-purple-400">
                  {applications.filter(a => a.status === "Shortlisted").length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Accepted</p>
                <p className="text-2xl font-bold text-green-400">
                  {applications.filter(a => a.status === "Accepted").length}
                </p>
              </div>
            </div>

            {/* Applications Grid */}
            <div className="grid gap-4">
              {applications.map((app, index) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {app.job?.title || "Job Title"}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                        <span>🏢 {app.job?.employer?.companyName || app.job?.employer?.name || "Company"}</span>
                        <span>📍 {app.job?.location || "Location"}</span>
                        {app.job?.jobType && <span>💼 {app.job.jobType}</span>}
                        {app.job?.salary && <span>💰 {app.job.salary}</span>}
                      </div>

                      <p className="text-gray-300 line-clamp-2 mb-3">
                        {app.job?.description || "No description"}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📅 Applied: {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</span>
                        {app.updatedAt && app.updatedAt !== app.createdAt && (
                          <span>🔄 Updated: {new Date(app.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 justify-end">
                      {app.job && (
                        <Link
                          to={`/job/${app.job._id}`}
                          className="px-4 py-2 bg-indigo-600/50 hover:bg-indigo-600 rounded-xl transition text-center text-sm"
                        >
                          View Job
                        </Link>
                      )}
                      {app.resume && (
                        <a
                          href={`http://localhost:4000${app.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition text-center text-sm"
                        >
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl transition ${
                      pagination.page === i + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyApplications;