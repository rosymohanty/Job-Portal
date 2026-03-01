import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";

const steps = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Selected",
];

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [timelineData, setTimelineData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await axios.get("/jobs/applied/me");
        setApplications(data.applications);
      } catch (error) {
        console.error(error);
        setApplications([]);
      }
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Selected":
        return "bg-green-500";
      case "Rejected":
        return "bg-red-500";
      case "Under Review":
        return "bg-yellow-500";
      case "Shortlisted":
        return "bg-blue-500";
      case "Interview Scheduled":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const fetchTimeline = async (applicationId) => {
    try {
      const { data } = await axios.get(
        `/jobs/applications/${applicationId}/timeline`
      );
      setTimelineData(data);
      setSelectedId(applicationId);
    } catch (error) {
      console.error(error);
    }
  };

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
          You haven’t applied for any jobs yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {applications.map((app, index) => (
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
                {app.job?.title}
              </h2>

              <p className="text-gray-300 mb-4">
                🏢 {app.job?.company}
              </p>

              <span
                className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(
                  app.status
                )}`}
              >
                {app.status}
              </span>

              {/* View Timeline Button */}
              <button
                onClick={() => fetchTimeline(app._id)}
                className="block mt-4 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                View Progress
              </button>

              {/* Timeline Section */}
              {selectedId === app._id && timelineData && (
                <div className="mt-6 border-t border-white/20 pt-4 space-y-4">
                  {steps.map((step, idx) => {
                    const completed = timelineData.timeline?.some(
                      (item) => item.status === step
                    );

                    const statusObj = timelineData.timeline?.find(
                      (item) => item.status === step
                    );

                    return (
                      <div key={idx} className="flex items-start gap-4">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                          ${
                            completed
                              ? "bg-green-500 text-white"
                              : "bg-gray-600 text-gray-300"
                          }`}
                        >
                          {completed ? "✓" : idx + 1}
                        </div>

                        <div>
                          <p
                            className={`font-medium ${
                              completed
                                ? "text-green-400"
                                : "text-gray-400"
                            }`}
                          >
                            {step}
                          </p>

                          {statusObj && (
                            <p className="text-xs text-gray-500">
                              {new Date(
                                statusObj.changedAt
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {timelineData.currentStatus === "Rejected" && (
                    <div className="flex items-center gap-4">
                      <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center">
                        ✕
                      </div>
                      <p className="text-red-400 font-medium">
                        Rejected
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;