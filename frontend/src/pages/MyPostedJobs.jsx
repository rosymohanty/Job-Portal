import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import { Link } from "react-router-dom";

const MyPostedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const { data } = await axios.get("/jobs/employer/my-jobs");

        // 🔥 FIX HERE
        setJobs(data.jobs || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
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
        My <span className="text-indigo-400">Posted Jobs</span>
      </motion.h1>

      {jobs.length === 0 ? (
        <div className="text-center text-gray-400">
          You haven’t posted any jobs yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {jobs.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ rotateY: 4, rotateX: 4, scale: 1.05 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl"
              style={{ transformStyle: "preserve-3d" }}
            >
              <h2 className="text-xl font-bold text-indigo-300 mb-2">
                {job.title}
              </h2>

              {/* 🔥 You don't have company field in schema */}
              <p className="text-gray-300 mb-4">
                📍 {job.location}
              </p>

              <p className="text-sm text-gray-400 mb-6 line-clamp-3">
                {job.description}
              </p>

              <Link
                to={`/view-applicants/${job._id}`}
                className="inline-block bg-indigo-600 px-5 py-2 rounded-xl hover:bg-indigo-700 hover:scale-105 transition duration-300"
              >
                View Applicants →
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostedJobs;