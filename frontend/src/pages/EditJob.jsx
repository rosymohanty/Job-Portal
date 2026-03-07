import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    salary: "",
    jobType: "Full-time",
    description: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.put(`/jobs/${id}`, formData);

      if (data.success) {
        toast.success("Job updated successfully");
        navigate("/my-jobs");
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to update job");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 md:px-8 text-white">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">
              Edit <span className="text-indigo-400">Job</span>
            </h1>
            <p className="text-gray-400 mt-2">
              Update your job posting details
            </p>
          </div>

          <Link
            to="/my-jobs"
            className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2 rounded-lg text-sm transition"
          >
            ← Back
          </Link>
        </div>

        {/* Card */}
        <form
          onSubmit={handleUpdateJob}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
        >

          {/* Job ID */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 text-sm">
              Job ID
            </label>

            <div className="bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-gray-400 text-sm">
              {id}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Job Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="Frontend Developer"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="Bangalore / Remote"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Salary
              </label>
              <input
                type="text"
                name="salary"
                placeholder="₹6-10 LPA"
                value={formData.salary}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Job Type
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Remote</option>
              </select>
            </div>

          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm text-gray-300 mb-2">
              Job Description
            </label>

            <textarea
              name="description"
              rows="5"
              placeholder="Write job description..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">

            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition"
            >
              Update Job
            </button>

            <Link
              to="/my-jobs"
              className="bg-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition"
            >
              Cancel
            </Link>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditJob;