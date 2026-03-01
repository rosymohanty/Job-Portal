import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { motion } from "framer-motion";

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/jobs/employer/dashboard");
        
        // Handle the new response structure with success flag
        if (data.success) {
          setStats(data.stats);
          setRecentApplications(data.recentApplications || []);
        } else {
          console.error("Failed to fetch stats:", data.message);
        }
      } catch (error) {
        console.error("Dashboard error:", error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Stats cards data with proper labels and values
  const cards = [
    { title: "Total Jobs Posted", value: stats?.totalJobs || 0, icon: "📊" },
    { title: "Active Jobs", value: stats?.activeJobs || 0, icon: "✅" },
    { title: "Total Applications", value: stats?.totalApplications || 0, icon: "📝" },
    { title: "Pending Review", value: stats?.Pending || 0, icon: "⏳" },
    { title: "Reviewed", value: stats?.Reviewed || 0, icon: "👀" },
    { title: "Shortlisted", value: stats?.Shortlisted || 0, icon: "⭐" },
    { title: "Accepted", value: stats?.Accepted || 0, icon: "🎉" },
    { title: "Rejected", value: stats?.Rejected || 0, icon: "❌" },
  ];

  // Calculate application rate
  const applicationRate = stats?.applicationRate || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-4 md:px-8 pb-12 text-white">
      
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Employer <span className="text-indigo-400">Dashboard</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Welcome back! Here's your recruitment overview
        </p>
      </motion.div>

      {/* Application Rate Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <p className="text-indigo-200 text-lg mb-2">Application Rate</p>
            <p className="text-4xl font-bold">{applicationRate} apps/job</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xl">
              <span className="text-3xl font-bold">{applicationRate}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, rotateY: 5 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl hover:bg-white/15 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{card.icon}</span>
              <span className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                {card.title.split(' ').pop()}
              </span>
            </div>
            <h2 className="text-sm text-gray-300 mb-2">
              {card.title}
            </h2>
            <p className="text-3xl font-bold text-indigo-400">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Applications Section */}
      {recentApplications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="bg-indigo-500 w-2 h-8 rounded-full mr-3"></span>
            Recent Applications
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  <th className="pb-4">Job Title</th>
                  <th className="pb-4">Applicant</th>
                  <th className="pb-4">Applied Date</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4">{app.job?.title || 'N/A'}</td>
                    <td className="py-4">{app.applicant?.name || 'N/A'}</td>
                    <td className="py-4">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${app.status === 'Accepted' ? 'bg-green-500/20 text-green-400' : 
                          app.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                          app.status === 'Shortlisted' ? 'bg-yellow-500/20 text-yellow-400' :
                          app.status === 'Reviewed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'}`}
                      >
                        {app.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
      >
        <button className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-xl transition-all duration-300 flex flex-col items-center">
          <span className="text-2xl mb-2">📌</span>
          <span>Post New Job</span>
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 p-4 rounded-xl transition-all duration-300 flex flex-col items-center">
          <span className="text-2xl mb-2">👥</span>
          <span>View Applicants</span>
        </button>
        <button className="bg-pink-600 hover:bg-pink-700 p-4 rounded-xl transition-all duration-300 flex flex-col items-center">
          <span className="text-2xl mb-2">📊</span>
          <span>Analytics</span>
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 p-4 rounded-xl transition-all duration-300 flex flex-col items-center">
          <span className="text-2xl mb-2">⚙️</span>
          <span>Settings</span>
        </button>
      </motion.div>
    </div>
  );
};

export default DashboardOverview;