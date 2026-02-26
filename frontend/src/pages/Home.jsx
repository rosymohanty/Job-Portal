import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get("/jobs");

        // 🔥 Handle different backend response formats safely
        if (Array.isArray(data)) {
          setJobs(data);
        } else if (Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        } else {
          setJobs([]);
        }

      } catch (error) {
        console.error(error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-8 text-white">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-10 text-center"
      >
        Explore <span className="text-indigo-400">Available Jobs</span>
      </motion.h1>

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-400">
          Loading jobs...
        </div>
      )}

      {/* No Jobs */}
      {!loading && jobs.length === 0 && (
        <div className="text-center text-gray-400">
          No jobs available right now.
        </div>
      )}

      {/* Job Grid */}
      {!loading && jobs.length > 0 && (
        <div className="grid md:grid-cols-3 gap-8">
          {jobs.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ rotateY: 5, rotateX: 5, scale: 1.05 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl transition duration-300"
              style={{ transformStyle: "preserve-3d" }}
            >
              <h2 className="text-xl font-bold mb-2 text-indigo-300">
                {job.title}
              </h2>

              <p className="text-gray-300 mb-2">
                {job.company}
              </p>

              <p className="text-sm text-gray-400 line-clamp-3">
                {job.description}
              </p>

              <Link
                to={`/job/${job._id}`}
                className="inline-block mt-4 px-4 py-2 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition duration-300"
              >
                View Details →
              </Link>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Home;