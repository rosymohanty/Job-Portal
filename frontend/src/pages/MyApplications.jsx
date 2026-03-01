import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";

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

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // Fix 1: Correct API endpoint
        const { data } = await axios.get("/api/jobs/applied/me");
        setApplications(data.applications || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-500";
      case "Rejected":
        return "bg-red-500";
      case "Reviewed":
        return "bg-yellow-500";
      case "Shortlisted":
        return "bg-blue-500";
      case "Pending":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-8 text-white flex items-center justify-center">
        <div className="text-indigo-400">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-8 text-white">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-10 text-center"
      >
        My <span className="text-indigo-400">Applications</span>
      </motion.h1>

      {applications.length === 0 ? (
        <div className="text-center text-gray-400">
          You haven't applied for any jobs yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {applications.map((app, index) => {
            const currentStepIndex = getStatusIndex(app.status);
            
            return (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ rotateY: 3, rotateX: 3, scale: 1.05 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl"
                style={{ transformStyle: "preserve-3d" }}
              >
                <h2 className="text-xl font-bold text-indigo-300 mb-2">
                  {app.job?.title || "Job Title"}
                </h2>

                {/* Fix 2: Access employer name correctly */}
                <p className="text-gray-300 mb-4">
                  🏢 {app.job?.employer?.name || "Company Name"}
                </p>

                <p className="text-gray-400 text-sm mb-4">
                  📍 {app.job?.location || "Location not specified"}
                </p>

                <span
                  className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(
                    app.status
                  )}`}
                >
                  {app.status || "Pending"}
                </span>

                {/* View Timeline Button */}
                <button
                  onClick={() => toggleTimeline(app._id)}
                  className="block mt-4 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
                >
                  {selectedId === app._id ? "Hide Progress" : "View Progress"}
                </button>

                {/* Timeline Section - Fix 3: Use current status to show progress */}
                {selectedId === app._id && (
                  <div className="mt-6 border-t border-white/20 pt-4 space-y-4">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex && app.status !== "Rejected";
                      const isCurrentStep = idx === currentStepIndex;
                      const isRejected = app.status === "Rejected";

                      return (
                        <div key={idx} className="flex items-start gap-4">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                              ${
                                isRejected && idx === steps.length - 1
                                  ? "bg-red-500 text-white"
                                  : isCompleted
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-600 text-gray-300"
                              }`}
                          >
                            {isRejected && idx === steps.length - 1 
                              ? "✕" 
                              : isCompleted 
                              ? "✓" 
                              : idx + 1}
                          </div>

                          <div className="flex-1">
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
                              <p className="text-xs text-indigo-400">
                                Current Status
                              </p>
                            )}

                            {isRejected && step === "Rejected" && (
                              <p className="text-xs text-red-400">
                                Application was rejected
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;