import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import { motion } from "framer-motion";

const ViewApplicants = () => {
  const { id } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const { data } = await axios.get(`/jobs/${id}/applicants`);
        setApplicants(data.applicants || []);
        setJobTitle(data.jobTitle || "");
      } catch (error) {
        console.error("Error fetching applicants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [id]);

  // 🔥 Handle Status Change
  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await axios.put(
        `/jobs/applications/${applicationId}/status`,
        { status: newStatus }
      );

      // Update UI instantly
      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicationId
            ? { ...app, status: newStatus }
            : app
        )
      );
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading applicants...
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
        <span className="text-indigo-400">{jobTitle}</span>
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
                {application.applicant?.name}
              </h2>

              <p className="text-gray-300 mb-2">
                📧 {application.applicant?.email}
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
                  className="w-full bg-indigo-600 text-white px-3 py-2 rounded-lg focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Shortlisted">
                    Shortlisted ⭐
                  </option>
                  <option value="Accepted">Accepted ✅</option>
                  <option value="Rejected">Rejected ❌</option>
                </select>
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