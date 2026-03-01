import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(false);

const handleApply = async (jobId) => {
  try {
    setLoading(true);

    const { data } = await axios.post(`/jobs/${jobId}/apply`);

    toast.success(data.message || "Applied successfully");
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await axios.get(`/jobs/${id}`);
        setJob(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async (jobId) => {
  try {
    const { data } = await axios.post(`/jobs/${jobId}/apply`);

    toast.success("Job applied successfully!");

  } catch (error) {
    toast.error(
      error.response?.data?.message || "Something went wrong"
    );
  }
};

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-6 text-white flex justify-center">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ rotateY: 3, rotateX: 3 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 max-w-3xl w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Title */}
        <h1 className="text-3xl font-bold text-indigo-400 mb-4">
          {job.title}
        </h1>

        {/* Company */}
        <p className="text-gray-300 mb-6 text-lg">
          🏢 {job.company}
        </p>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Job Description
          </h2>
          <p className="text-gray-400 leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Extra Info (Optional if exists in your model) */}
        {job.location && (
          <p className="text-gray-400 mb-2">
            📍 Location: {job.location}
          </p>
        )}

        {job.salary && (
          <p className="text-gray-400 mb-4">
            💰 Salary: {job.salary}
          </p>
        )}

        {/* Apply Button (User Only) */}
        {user?.role === "user" && (
  <button
    onClick={() => handleApply(job._id)}
    disabled={loading}
    className="mt-6 bg-indigo-600 px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 hover:scale-105 transition duration-300 shadow-lg disabled:opacity-50"
  >
    {loading ? "Applying..." : "Apply Now"}
  </button>
)}
      </motion.div>
    </div>
  );
};

export default JobDetails;