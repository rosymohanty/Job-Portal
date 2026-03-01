import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";

const Home = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    jobType: "all",
    page: 1,
    limit: 9
  });
  const [pagination, setPagination] = useState({
    totalJobs: 0,
    totalPages: 1,
    currentPage: 1
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0
  });

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  });

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [filters.keyword, filters.location, filters.jobType, filters.page]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.keyword) params.append("keyword", filters.keyword);
      if (filters.location) params.append("location", filters.location);
      if (filters.jobType && filters.jobType !== "all") params.append("jobType", filters.jobType);
      params.append("page", filters.page);
      params.append("limit", filters.limit);

      const { data } = await axios.get(`/jobs?${params.toString()}`);

      // Handle different backend response formats
      if (data.success) {
        setJobs(data.jobs || []);
        setPagination({
          totalJobs: data.totalJobs || 0,
          totalPages: data.totalPages || 1,
          currentPage: data.currentPage || 1
        });
      } else if (Array.isArray(data)) {
        setJobs(data);
      } else if (Array.isArray(data.jobs)) {
        setJobs(data.jobs);
        setPagination({
          totalJobs: data.totalJobs || data.jobs.length,
          totalPages: data.totalPages || 1,
          currentPage: data.currentPage || 1
        });
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("/jobs/stats/overview");
      if (data.success) {
        setStats({
          total: data.stats.total || 0,
          active: data.stats.active || 0
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getJobTypeColor = (jobType) => {
    switch (jobType) {
      case "Full-time":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Part-time":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Internship":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Contract":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Remote":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 md:px-8 pb-12 text-white">
      
      {/* Hero Section with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Explore <span className="text-indigo-400">Available Jobs</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Find your next career opportunity from {stats.active} active job listings
        </p>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto mb-10"
      >
        <form onSubmit={handleSearch} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              name="keyword"
              placeholder="Job title or keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              className="w-full p-3 rounded-xl bg-white/10 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full p-3 rounded-xl bg-white/10 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="w-full p-3 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all" className="bg-gray-900">All Job Types</option>
              <option value="Full-time" className="bg-gray-900">Full-time</option>
              <option value="Part-time" className="bg-gray-900">Part-time</option>
              <option value="Internship" className="bg-gray-900">Internship</option>
              <option value="Contract" className="bg-gray-900">Contract</option>
              <option value="Remote" className="bg-gray-900">Remote</option>
            </select>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
            >
              Search Jobs
            </button>
          </div>
        </form>
      </motion.div>

      {/* Results Count */}
      {!loading && jobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto mb-6 text-gray-400"
        >
          Found {pagination.totalJobs} jobs
          {filters.keyword && ` matching "${filters.keyword}"`}
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading jobs...</p>
          </div>
        </div>
      )}

      {/* No Jobs Found */}
      {!loading && jobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 max-w-2xl mx-auto"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-300 mb-4">
            No Jobs Found
          </h2>
          <p className="text-gray-400 mb-8">
            Try adjusting your search filters or check back later.
          </p>
          <button
            onClick={() => {
              setFilters({ keyword: "", location: "", jobType: "all", page: 1, limit: 9 });
              fetchJobs();
            }}
            className="bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Job Grid */}
      {!loading && jobs.length > 0 && (
        <>
          <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {jobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header with Job Type */}
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-indigo-300 line-clamp-1 flex-1">
                      {job.title}
                    </h2>
                    {job.jobType && (
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold border ${getJobTypeColor(job.jobType)}`}>
                        {job.jobType}
                      </span>
                    )}
                  </div>

                  {/* Company Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🏢</span>
                    <span className="text-gray-300">
                      {job.employer?.companyName || job.employer?.name || "Company"}
                    </span>
                  </div>

                  {/* Location */}
                  <p className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <span>📍</span>
                    {job.location || "Location not specified"}
                  </p>

                  {/* Salary (if available) */}
                  {job.salary && (
                    <p className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                      <span>💰</span>
                      {job.salary}
                    </p>
                  )}

                  {/* Description Preview */}
                  <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                    {job.description}
                  </p>

                  {/* View Details Button */}
                  <Link
                    to={`/jobs/${job._id}`}
                    className="inline-block w-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 rounded-xl text-center font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
                  >
                    View Details →
                  </Link>
                </div>

                {/* Footer with Date */}
                <div className="bg-white/5 px-6 py-3 text-xs text-gray-500 border-t border-white/10">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center items-center gap-2 mt-10"
            >
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 rounded-xl transition ${
                    filters.page === i + 1
                      ? "bg-indigo-600 text-white"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === pagination.totalPages}
                className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* Browse More CTA */}
      {!loading && jobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">Can't find what you're looking for?</p>
          <button
            onClick={() => {
              setFilters({ keyword: "", location: "", jobType: "all", page: 1, limit: 9 });
              fetchJobs();
            }}
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            Clear all filters →
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Home;