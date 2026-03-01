import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "../utils/axios";

const Landing = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCompanies: 0,
    totalApplications: 0
  });
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch job statistics from your backend
        const { data } = await axios.get("/jobs/stats/overview");
        if (data.success) {
          setStats({
            totalJobs: data.stats.total || 0,
            activeJobs: data.stats.active || 0,
            totalCompanies: data.stats.byType?.length || 0,
            totalApplications: 0 // This would come from another endpoint
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchFeaturedJobs = async () => {
      try {
        const { data } = await axios.get("/jobs/featured/limit/3");
        if (data.success) {
          setFeaturedJobs(data.jobs || []);
        }
      } catch (error) {
        console.error("Error fetching featured jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchFeaturedJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 text-white overflow-hidden relative">

      {/* Animated Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute w-96 h-96 bg-purple-600 opacity-20 blur-3xl rounded-full top-10 left-10"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute w-96 h-96 bg-indigo-600 opacity-20 blur-3xl rounded-full bottom-10 right-10"
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0.1 
            }}
            animate={{ 
              y: [null, -30, 30, -30],
              x: [null, 30, -30, 30],
            }}
            transition={{ 
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear" 
            }}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
          />
        ))}
      </div>

      {/* Navbar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center px-6 md:px-10 py-6 relative z-10"
      >
        <motion.h1 
          whileHover={{ scale: 1.05 }}
          className="text-2xl md:text-3xl font-bold tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
        >
          TransHire
        </motion.h1>

        <div className="space-x-4 md:space-x-6">
          <Link 
            to="/login" 
            className="hover:text-indigo-400 transition-colors duration-300 text-sm md:text-base"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 md:px-5 py-2 rounded-xl shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all duration-300 text-sm md:text-base"
          >
            Register
          </Link>
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className="flex flex-col justify-center items-center text-center px-4 mt-12 md:mt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
            Find Your <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">Dream Job</span>
          </h2>
          <p className="mt-4 md:mt-6 text-gray-300 max-w-2xl mx-auto text-sm md:text-base lg:text-lg">
            Connect with top companies or hire the best talent easily. 
            Your next career move starts here.
          </p>
        </motion.div>

        {/* Stats Counter */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 md:mt-10"
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-indigo-400">{stats.activeJobs}+</div>
              <div className="text-xs md:text-sm text-gray-400">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-400">{stats.totalCompanies}+</div>
              <div className="text-xs md:text-sm text-gray-400">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-pink-400">500+</div>
              <div className="text-xs md:text-sm text-gray-400">Placements</div>
            </div>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/register"
            className="px-6 md:px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-indigo-500/25 hover:scale-105 transition-all duration-300 text-sm md:text-base"
          >
            Get Started
          </Link>
          <Link
            to="/jobs"
            className="px-6 md:px-8 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl hover:bg-white/20 hover:scale-105 transition-all duration-300 text-sm md:text-base"
          >
            Browse Jobs
          </Link>
        </motion.div>
      </div>

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-6xl mx-auto px-4 mt-16 md:mt-24 relative z-10"
        >
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8">
            Featured <span className="text-indigo-400">Jobs</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl"
                style={{ transformStyle: "preserve-3d" }}
              >
                <h4 className="text-lg font-semibold text-indigo-300 mb-2">{job.title}</h4>
                <p className="text-sm text-gray-400 mb-2">📍 {job.location}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{job.description}</p>
                {job.jobType && (
                  <span className="inline-block mt-3 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs">
                    {job.jobType}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="max-w-6xl mx-auto px-4 mt-16 md:mt-24 mb-16 relative z-10"
      >
        <h3 className="text-xl md:text-2xl font-bold text-center mb-8">
          Why Choose <span className="text-indigo-400">TransHire</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl text-center"
          >
            <div className="text-4xl mb-4">🎯</div>
            <h4 className="text-lg font-semibold mb-2">Smart Matching</h4>
            <p className="text-sm text-gray-400">AI-powered job recommendations tailored to your skills</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl text-center"
          >
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-lg font-semibold mb-2">Quick Apply</h4>
            <p className="text-sm text-gray-400">One-click applications with your saved profile</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl text-center"
          >
            <div className="text-4xl mb-4">📊</div>
            <h4 className="text-lg font-semibold mb-2">Track Progress</h4>
            <p className="text-sm text-gray-400">Real-time updates on your application status</p>
          </motion.div>
        </div>
      </motion.div>

      {/* 3D Floating Glass Card - FIXED: Removed duplicate transition prop */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        whileHover={{ rotateY: 10, rotateX: 5, scale: 1.05 }}
        className="hidden lg:block absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl text-center w-80 z-20"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-50 blur-xl"
        />
        <h3 className="text-xl font-semibold text-indigo-300 mb-2">
          🚀 {stats.activeJobs}+ Jobs Available
        </h3>
        <p className="text-gray-300 mt-2">
          Start your career journey today.
        </p>
        <Link
          to="/register"
          className="inline-block mt-4 px-6 py-2 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition text-sm"
        >
          Join Now
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="relative z-10 mt-16 py-6 border-t border-white/10 text-center text-gray-500 text-sm"
      >
        <p>© 2024 TransHire. All rights reserved.</p>
      </motion.footer>
    </div>
  );
};

export default Landing;