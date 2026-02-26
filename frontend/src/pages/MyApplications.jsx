import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await axios.get("/jobs/applied/me");
        setApplications(data.applications); // ✅ FIXED
      } catch (error) {
        console.error(error);
        setApplications([]); // safety
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
      default:
        return "bg-gray-500";
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
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;