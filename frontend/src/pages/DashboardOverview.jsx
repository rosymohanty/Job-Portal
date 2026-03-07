import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { motion } from "framer-motion";

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/jobs/employer/stats");

        if (data.success) {
          const overview = data.data?.overview || {};
          const status = data.data?.statusBreakdown || {};

          setStats({
            totalJobs: overview.totalJobs || 0,
            activeJobs: overview.activeJobs || 0,
            totalApplications: overview.totalApplications || 0,
            applicationRate: overview.applicationRate || 0,
            Pending: status.Pending || 0,
            Reviewed: status.Reviewed || 0,
            Shortlisted: status.Shortlisted || 0,
            Accepted: status.Accepted || 0,
            Rejected: status.Rejected || 0
          });

          setRecentApplications(data.data?.recentApplications || []);
        }
      } catch (error) {
        console.error("Dashboard error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const cards = [
    { title: "Total Jobs", value: stats.totalJobs, icon: "📊" },
    { title: "Active Jobs", value: stats.activeJobs, icon: "✅" },
    { title: "Applications", value: stats.totalApplications, icon: "📄" },
    { title: "Pending", value: stats.Pending, icon: "⏳" },
    { title: "Reviewed", value: stats.Reviewed, icon: "👀" },
    { title: "Shortlisted", value: stats.Shortlisted, icon: "⭐" },
    { title: "Accepted", value: stats.Accepted, icon: "🎉" },
    { title: "Rejected", value: stats.Rejected, icon: "❌" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-6 text-white">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold">
          Employer <span className="text-indigo-400">Dashboard</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Overview of your recruitment performance
        </p>
      </motion.div>

      {/* Application Rate */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-10 shadow-xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-indigo-200 text-lg">Application Rate</p>
            <h2 className="text-4xl font-bold mt-1">
              {stats.applicationRate} apps/job
            </h2>
          </div>

          <div className="mt-6 md:mt-0 w-28 h-28 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-lg">
            {stats.applicationRate}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex justify-between mb-4">
              <span className="text-3xl">{card.icon}</span>
              <span className="text-xs text-gray-400">Stat</span>
            </div>

            <h3 className="text-sm text-gray-300">{card.title}</h3>

            <p className="text-3xl font-bold text-indigo-400">
              {card.value}
            </p>
          </motion.div>
        ))}

      </div>

      {/* Recent Applications */}
      {recentApplications.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
        >
          <h2 className="text-2xl font-bold mb-6">Recent Applications</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="pb-4">Job</th>
                  <th className="pb-4">Applicant</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentApplications.map((app, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-4">{app.job?.title}</td>
                    <td className="py-4">{app.applicant?.name}</td>
                    <td className="py-4">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-indigo-500/20 text-indigo-400">
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default DashboardOverview;