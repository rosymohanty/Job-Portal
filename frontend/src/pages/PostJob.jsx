import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PostJob = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    salary: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/jobs", form);
      toast.success("Job posted successfully 🚀");
      navigate("/my-jobs");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post job");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-6">

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-10 w-full max-w-2xl text-white"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">
          Post a New Job 🚀
        </h2>

        {/* Job Title */}
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 rounded-xl bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Company */}
        <input
          type="text"
          name="company"
          placeholder="Company Name"
          value={form.company}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 rounded-xl bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Location */}
        <input
          type="text"
          name="location"
          placeholder="Location (Optional)"
          value={form.location}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-xl bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Salary */}
        <input
          type="text"
          name="salary"
          placeholder="Salary (Optional)"
          value={form.salary}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-xl bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Job Description"
          value={form.description}
          onChange={handleChange}
          required
          rows="4"
          className="w-full p-3 mb-6 rounded-xl bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-700 hover:scale-105 transition duration-300 shadow-lg"
        >
          Post Job
        </button>
      </motion.form>
    </div>
  );
};

export default PostJob;