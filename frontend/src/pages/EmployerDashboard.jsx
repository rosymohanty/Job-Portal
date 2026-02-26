import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const EmployerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-8 text-white">

      {/* Welcome Section */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-10"
      >
        Welcome, <span className="text-indigo-400">{user?.name}</span> 👋
      </motion.h1>

      {/* Dashboard Cards */}
      <div className="grid md:grid-cols-3 gap-8">

        {/* Post Job Card */}
        <motion.div
          whileHover={{ rotateY: 5, rotateX: 5, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-indigo-300">
            🚀 Post a New Job
          </h2>

          <p className="text-gray-400 mb-6">
            Create a new job listing and attract top talent.
          </p>

          <Link
            to="/post-job"
            className="inline-block bg-indigo-600 px-5 py-3 rounded-xl hover:bg-indigo-700 hover:scale-105 transition duration-300"
          >
            Post Job
          </Link>
        </motion.div>

        {/* My Jobs Card */}
        <motion.div
          whileHover={{ rotateY: -5, rotateX: 5, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-indigo-300">
            📋 My Posted Jobs
          </h2>

          <p className="text-gray-400 mb-6">
            View and manage all your job postings.
          </p>

          <Link
            to="/my-jobs"
            className="inline-block bg-indigo-600 px-5 py-3 rounded-xl hover:bg-indigo-700 hover:scale-105 transition duration-300"
          >
            View Jobs
          </Link>
        </motion.div>

        {/* Analytics Placeholder */}
        <motion.div
  whileHover={{ rotateY: 5, rotateX: -5, scale: 1.05 }}
  transition={{ type: "spring", stiffness: 200 }}
  className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl"
  style={{ transformStyle: "preserve-3d" }}
>
  <h2 className="text-xl font-semibold mb-4 text-indigo-300">
    📊 Dashboard Overview
  </h2>

  <p className="text-gray-400 mb-6">
    Monitor your job postings and applicants.
  </p>

  <Link
    to="/employer/dashboard"
    className="inline-block bg-indigo-600 px-5 py-3 rounded-xl hover:bg-indigo-700 hover:scale-105 transition duration-300"
  >
    View Dashboard
  </Link>
</motion.div>

      </div>
    </div>
  );
};

export default EmployerDashboard;