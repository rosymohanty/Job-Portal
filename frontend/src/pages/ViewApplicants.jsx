import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ViewApplicants = () => {
  const { id } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const { data } = await axios.get(`/jobs/${id}/applicants`);
        setApplicants(data.applicants || []);
        setJobTitle(data.jobTitle || "");
      } catch (error) {
        console.error("Error fetching applicants:", error);
        toast.error("Failed to load applicants");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [id]);

  // 🔥 Fixed Handle Status Change
  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      
      // FIXED: Send { status: value } not { newStatus: value }
      const response = await axios.put(
        `/jobs/applications/${applicationId}/status`,
        { 
          status: newStatus  // ✅ Changed from newStatus to status
        }
      );

      // Update local state
      setApplicants(prev => 
        prev.map(app => 
          app._id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );

      toast.success(`Status updated to ${newStatus}`);
      
    } catch (error) {
      console.error("Status update error:", error);
      
      // Better error message
      const errorMessage = error.response?.data?.message || "Failed to update status";
      toast.error(errorMessage);
      
    } finally {
      setUpdatingId(null);
    }
  };

  // Get status color for dropdown styling
  const getStatusColor = (status) => {
    switch(status) {
      case "Selected": return "bg-green-600";
      case "Rejected": return "bg-red-600";
      case "Shortlisted": return "bg-yellow-600";
      case "Interview Scheduled": return "bg-purple-600";
      case "Under Review": return "bg-blue-600";
      default: return "bg-indigo-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-indigo-400">Loading applicants...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-8 text-white">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-10 text-center"
      >
        Applicants for{" "}
        <span className="text-indigo-400">{jobTitle || "Job"}</span>
      </motion.h1>

      {applicants.length === 0 ? (
        <div className="text-center text-gray-400">
          No applicants yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {applicants.map((application, index) => (
            <motion.div
              key={application._id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl ${
                application.status === "Shortlisted"
                  ? "ring-2 ring-yellow-400"
                  : ""
              }`}
            >
              <h2 className="text-xl font-bold text-indigo-300 mb-2">
                {application.applicant?.name || "Unknown"}
              </h2>

              <p className="text-gray-300 mb-2">
                📧 {application.applicant?.email || "No email"}
              </p>

              {application.applicant?.phone && (
                <p className="text-gray-300 mb-2">
                  📱 {application.applicant.phone}
                </p>
              )}

              {application.applicant?.skills && (
                <p className="text-gray-400 text-sm mb-4">
                  💼 Skills: {application.applicant.skills}
                </p>
              )}

              {/* Current Status Badge */}
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                  application.status === "Selected" ? "bg-green-600" :
                  application.status === "Rejected" ? "bg-red-600" :
                  application.status === "Shortlisted" ? "bg-yellow-600" :
                  "bg-indigo-600"
                }`}>
                  Current: {application.status}
                </span>
              </div>

              {/* ⭐ Status Dropdown */}
              <div className="mt-4">
                <label className="block text-sm mb-2 text-gray-400">
                  Update Status
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
                  className={`w-full ${getStatusColor(application.status)} text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50`}
                >
                  {/* FIXED: Match backend valid statuses exactly */}
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Shortlisted">Shortlisted ⭐</option>
                  <option value="Accepted">Accepted ✅</option>
                  <option value="Rejected">Rejected ❌</option>
                </select>
                
                {updatingId === application._id && (
                  <p className="text-xs text-indigo-400 mt-2">Updating...</p>
                )}
              </div>

              {/* ⭐ Highlight Shortlisted */}
              {application.status === "Shortlisted" && (
                <div className="mt-3 text-yellow-400 font-semibold">
                  ⭐ Shortlisted Candidate
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewApplicants;