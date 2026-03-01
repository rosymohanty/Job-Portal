import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage to check if employer is approved
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    jobType: "Full-time",
    requirements: [""],
    responsibilities: [""],
    benefits: [""],
    experienceLevel: "Entry",
    applicationDeadline: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle array fields (requirements, responsibilities, benefits)
  const handleArrayChange = (index, field, value) => {
    const updatedArray = [...form[field]];
    updatedArray[index] = value;
    setForm({ ...form, [field]: updatedArray });
  };

  const addArrayField = (field) => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const removeArrayField = (field, index) => {
    if (form[field].length > 1) {
      const updatedArray = form[field].filter((_, i) => i !== index);
      setForm({ ...form, [field]: updatedArray });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Filter out empty array items
    const filteredForm = {
      ...form,
      requirements: form.requirements.filter(req => req.trim() !== ""),
      responsibilities: form.responsibilities.filter(resp => resp.trim() !== ""),
      benefits: form.benefits.filter(benefit => benefit.trim() !== ""),
    };

    try {
      const { data } = await axios.post("/jobs/employer/jobs", filteredForm);
      
      if (data.success) {
        toast.success(data.message || "Job posted successfully 🚀");
        navigate("/employer/jobs");
      } else {
        toast.error(data.message || "Failed to post job");
      }
    } catch (error) {
      console.error("Post job error:", error);
      toast.error(error.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  // Check if employer is approved
  if (user && user.isApproved === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 max-w-2xl text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4 text-yellow-400">⏳ Pending Approval</h2>
          <p className="text-gray-300 mb-6">
            Your employer account is pending admin approval. You'll be able to post jobs once your account is approved.
          </p>
          <button
            onClick={() => navigate("/employer/dashboard")}
            className="bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 md:px-6 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <span>←</span> Back
        </button>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 md:p-10 text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Post a New Job 🚀
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Fill in the details to attract the best candidates
          </p>

          {/* Basic Information Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-indigo-400 mb-4">Basic Information</h3>
            
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Senior Software Engineer"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-xl bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g. New York, NY or Remote"
                value={form.location}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-xl bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Job Type and Experience Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Type *
                </label>
                <select
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-white/20 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Full-time" className="bg-gray-900">Full-time</option>
                  <option value="Part-time" className="bg-gray-900">Part-time</option>
                  <option value="Internship" className="bg-gray-900">Internship</option>
                  <option value="Contract" className="bg-gray-900">Contract</option>
                  <option value="Remote" className="bg-gray-900">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Experience Level
                </label>
                <select
                  name="experienceLevel"
                  value={form.experienceLevel}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-white/20 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Entry" className="bg-gray-900">Entry Level</option>
                  <option value="Mid" className="bg-gray-900">Mid Level</option>
                  <option value="Senior" className="bg-gray-900">Senior Level</option>
                  <option value="Lead" className="bg-gray-900">Lead</option>
                </select>
              </div>
            </div>

            {/* Salary and Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Salary (Optional)
                </label>
                <input
                  type="text"
                  name="salary"
                  placeholder="e.g. $80k - $100k"
                  value={form.salary}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={form.applicationDeadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 rounded-xl bg-white/20 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                placeholder="Describe the role, responsibilities, and ideal candidate..."
                value={form.description}
                onChange={handleChange}
                required
                rows="6"
                className="w-full p-3 rounded-xl bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Requirements Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Requirements
              </label>
              {form.requirements.map((req, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => handleArrayChange(index, "requirements", e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    className="flex-1 p-2 rounded-lg bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayField("requirements", index)}
                    className="px-3 bg-red-500/50 hover:bg-red-500 rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField("requirements")}
                className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
              >
                + Add Requirement
              </button>
            </div>

            {/* Responsibilities Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Responsibilities
              </label>
              {form.responsibilities.map((resp, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => handleArrayChange(index, "responsibilities", e.target.value)}
                    placeholder={`Responsibility ${index + 1}`}
                    className="flex-1 p-2 rounded-lg bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayField("responsibilities", index)}
                    className="px-3 bg-red-500/50 hover:bg-red-500 rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField("responsibilities")}
                className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
              >
                + Add Responsibility
              </button>
            </div>

            {/* Benefits Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Benefits
              </label>
              {form.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleArrayChange(index, "benefits", e.target.value)}
                    placeholder={`Benefit ${index + 1}`}
                    className="flex-1 p-2 rounded-lg bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayField("benefits", index)}
                    className="px-3 bg-red-500/50 hover:bg-red-500 rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField("benefits")}
                className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
              >
                + Add Benefit
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Posting...
                </span>
              ) : (
                "Post Job"
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            * Required fields
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default PostJob;