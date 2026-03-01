import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quickStats, setQuickStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/login");
    }

    // Fetch quick stats for the dashboard cards
    const fetchQuickStats = async () => {
      try {
        const { data } = await axios.get("/jobs/employer/dashboard");
        if (data.success) {
          setQuickStats({
            totalJobs: data.stats.totalJobs || 0,
            totalApplications: data.stats.totalApplications || 0,
            pendingApplications: data.stats.Pending || 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuickStats();
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if employer is approved
  if (user.isApproved === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-3xl p-12">
            <h1 className="text-4xl font-bold mb-6">
              ⏳ <span className="text-yellow-400">Pending Approval</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Your employer account is currently under review by our admin team.
              You'll be able to post jobs once your account is approved.
            </p>
            <div className="bg-white/10 rounded-2xl p-6">
              <p className="text-gray-400">
                This usually takes 24-48 hours. We'll notify you via email once approved.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const cards = [
    {
      title: "Post a New Job",
      description: "Create a new job listing and attract top talent.",
      icon: "🚀",
      link: "/post-job",
      linkText: "Post Job",
      stats: null,
      color: "from-indigo-600 to-indigo-700"
    },
    {
      title: "My Posted Jobs",
      description: `You have ${quickStats.totalJobs} active job posting${quickStats.totalJobs !== 1 ? 's' : ''}`,
      icon: "📋",
      link: "/my-jobs",
      linkText: "View Jobs",
      stats: quickStats.totalJobs,
      color: "from-purple-600 to-purple-700"
    },
    {
      title: "Applications",
      description: `${quickStats.pendingApplications} pending, ${quickStats.totalApplications} total`,
      icon: "📊",
      link: "/employer/dashboard",
      linkText: "View Dashboard",
      stats: quickStats.totalApplications,
      color: "from-pink-600 to-pink-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 md:px-8 pb-12 text-white">

      {/* Welcome Section with Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back,{' '}
              <span className="text-indigo-400">{user?.name?.split(' ')[0] || 'Employer'}</span> 👋
            </h1>
            <p className="text-gray-400 text-lg">
              {user?.companyName ? (
                <>Managing <span className="text-indigo-400">{user.companyName}</span></>
              ) : (
                'Manage your job postings and applicants'
              )}
            </p>
          </div>
          
          {/* Quick Stats Badge */}
          <div className="mt-4 md:mt-0 flex gap-4">
            <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20">
              <span className="text-indigo-400 font-bold">{quickStats.totalJobs}</span>
              <span className="text-gray-400 text-sm ml-2">Total Jobs</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20">
              <span className="text-indigo-400 font-bold">{quickStats.totalApplications}</span>
              <span className="text-gray-400 text-sm ml-2">Applications</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
              rotateY: 5, 
              rotateX: 5, 
              scale: 1.03,
              transition: { type: "spring", stiffness: 300 }
            }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden group"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Background Gradient on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
            
            {/* Card Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{card.icon}</span>
                {card.stats !== null && (
                  <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-sm font-semibold">
                    {card.stats}
                  </span>
                )}
              </div>
              
              <h2 className="text-2xl font-semibold mb-3 text-indigo-300">
                {card.title}
              </h2>

              <p className="text-gray-400 mb-8 min-h-[60px]">
                {card.description}
              </p>

              <Link
                to={card.link}
                className={`inline-block bg-gradient-to-r ${card.color} px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 font-medium w-full text-center`}
              >
                {card.linkText}
              </Link>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
          </motion.div>
        ))}
      </div>

      {/* Quick Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <span className="bg-indigo-500 w-2 h-6 rounded-full mr-3"></span>
          Quick Tips for Employers
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-500/20 p-3 rounded-xl">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <h4 className="font-medium mb-2">Write Clear Descriptions</h4>
              <p className="text-sm text-gray-400">Detailed job descriptions attract better candidates</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-500/20 p-3 rounded-xl">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h4 className="font-medium mb-2">Review Quickly</h4>
              <p className="text-sm text-gray-400">Prompt responses improve candidate experience</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-500/20 p-3 rounded-xl">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h4 className="font-medium mb-2">Track Performance</h4>
              <p className="text-sm text-gray-400">Use analytics to optimize your job postings</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployerDashboard;