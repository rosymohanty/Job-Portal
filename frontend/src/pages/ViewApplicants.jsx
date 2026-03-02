import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const ViewApplicants = () => {
  const { id } = useParams(); // Get job ID from URL
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1
  });

  useEffect(() => {
    fetchApplicants();
  }, [id, filters.status, filters.page]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      console.log("Fetching applicants for job ID:", id);
      
      const { data } = await axios.get(`/jobs/employer/jobs/${id}/applicants`, {
        params: {
          status: filters.status !== "all" ? filters.status : undefined,
          page: filters.page,
          limit: filters.limit
        }
      });
      
      console.log("Applicants response:", data);
      
      if (data.success) {
        // Handle different response structures
        if (data.data) {
          setApplicants(data.data.applicants || []);
          setJobDetails({
            title: data.data.jobTitle || "Job",
            stats: data.data.stats || {}
          });
          setPagination({
            total: data.data.pagination?.total || 0,
            totalPages: data.data.pagination?.totalPages || 1,
            currentPage: data.data.pagination?.currentPage || 1
          });
        } else {
          setApplicants(data.applicants || []);
          setJobDetails({
            title: data.jobTitle || "Job",
            stats: data.stats || {}
          });
          setPagination({
            total: data.pagination?.total || 0,
            totalPages: data.pagination?.totalPages || 1,
            currentPage: data.pagination?.currentPage || 1
          });
        }
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
      const { data } = await axios.put(`/jobs/employer/applications/${applicationId}/status`, {
        status: newStatus
      });
      
      if (data.success) {
        toast.success(`Application ${newStatus.toLowerCase()}`);
        // Refresh the list
        fetchApplicants();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
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

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading applicants...</p>
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
              Applicants for {jobDetails?.title || "Job"} 👥
            </h1>
            <p className="text-gray-400">
              Review and manage applications
            </p>
          </div>
          
          <button
            onClick={() => navigate("/my-jobs")}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
          >
            ← Back to Jobs
          </button>
        </div>

        {/* Stats Cards */}
        {jobDetails?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{jobDetails.stats.total || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{jobDetails.stats.Pending || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Reviewed</p>
              <p className="text-2xl font-bold text-blue-400">{jobDetails.stats.Reviewed || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Shortlisted</p>
              <p className="text-2xl font-bold text-purple-400">{jobDetails.stats.Shortlisted || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Accepted</p>
              <p className="text-2xl font-bold text-green-400">{jobDetails.stats.Accepted || 0}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-gray-400">Filter by status:</label>
            <select
              value={filters.status}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all" className="bg-gray-900">All Applications</option>
              <option value="Pending" className="bg-gray-900">Pending</option>
              <option value="Reviewed" className="bg-gray-900">Reviewed</option>
              <option value="Shortlisted" className="bg-gray-900">Shortlisted</option>
              <option value="Accepted" className="bg-gray-900">Accepted</option>
              <option value="Rejected" className="bg-gray-900">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applicants List */}
        {applicants.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center"
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Applicants Yet</h2>
            <p className="text-gray-400 mb-8">
              No one has applied for this job yet. Check back later!
            </p>
            <button
              onClick={() => navigate("/my-jobs")}
              className="bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
            >
              Back to My Jobs
            </button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-4">
              {applicants.map((applicant, index) => (
                <motion.div
                  key={applicant._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Applicant Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {applicant.applicant?.name || "Unknown"}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(applicant.status)}`}>
                          {applicant.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                        <span>📧 {applicant.applicant?.email || "No email"}</span>
                        {applicant.applicant?.phone && <span>📞 {applicant.applicant.phone}</span>}
                      </div>

                      {applicant.applicant?.skills && applicant.applicant.skills.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {applicant.applicant.skills.slice(0, 5).map((skill, i) => (
                              <span key={i} className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs">
                                {skill}
                              </span>
                            ))}
                            {applicant.applicant.skills.length > 5 && (
                              <span className="text-xs text-gray-500">+{applicant.applicant.skills.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        Applied: {new Date(applicant.appliedAt || applicant.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <select
                        value={applicant.status}
                        onChange={(e) => handleStatusChange(applicant._id, e.target.value)}
                        className="px-3 py-2 bg-white/10 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Pending" className="bg-gray-900">Pending</option>
                        <option value="Reviewed" className="bg-gray-900">Reviewed</option>
                        <option value="Shortlisted" className="bg-gray-900">Shortlisted</option>
                        <option value="Accepted" className="bg-gray-900">Accepted</option>
                        <option value="Rejected" className="bg-gray-900">Rejected</option>
                      </select>
                      
                      {applicant.resume && (
                        <a
                          href={`http://localhost:4000${applicant.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-center px-3 py-2 bg-indigo-600/50 hover:bg-indigo-600 rounded-lg transition text-sm"
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
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl transition ${
                      filters.page === i + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === pagination.totalPages}
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

export default ViewApplicants;