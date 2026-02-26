import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 text-white overflow-hidden relative">

      {/* Animated Background Glow */}
      <div className="absolute w-96 h-96 bg-purple-600 opacity-20 blur-3xl rounded-full top-10 left-10 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-indigo-600 opacity-20 blur-3xl rounded-full bottom-10 right-10 animate-pulse"></div>

      {/* Navbar */}
      <div className="flex justify-between items-center px-10 py-6 relative z-10">
        <h1 className="text-2xl font-bold tracking-wide">
          JobPortal
        </h1>

        <div className="space-x-6">
          <Link to="/login" className="hover:text-indigo-400 transition">
            Login
          </Link>
          <Link
            to="/register"
            className="bg-indigo-600 px-5 py-2 rounded-xl shadow-lg hover:scale-105 transition duration-300"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col justify-center items-center text-center px-6 mt-20 relative z-10">

        <motion.h2
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold leading-tight"
        >
          Find Your <span className="text-indigo-400">Dream Job</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-gray-300 max-w-xl"
        >
          Connect with top companies or hire the best talent easily.
          
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex space-x-6"
        >
          

          <Link
            to="/register"
            className="px-8 py-3 bg-white text-black rounded-2xl shadow-xl hover:scale-105 transition duration-300"
          >
            Get Started
          </Link>
        </motion.div>
      </div>

      {/* 3D Floating Glass Card */}
      <motion.div
        whileHover={{ rotateY: 10, rotateX: 5, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl text-center w-80"
        style={{ transformStyle: "preserve-3d" }}
      >
        <h3 className="text-xl font-semibold text-indigo-300">
          🚀 1000+ Jobs Available
        </h3>
        <p className="text-gray-300 mt-2">
          Start your career journey today.
        </p>
      </motion.div>

    </div>
  );
};

export default Landing;