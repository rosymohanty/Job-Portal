import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { motion } from "framer-motion";

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          "/jobs/employer/dashboard-stats"
        );
        setStats(data);
      } catch (error) {
        console.error("Dashboard error:", error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading dashboard...
      </div>
    );
  }

  const cards = [
    { title: "Total Jobs", value: stats.totalJobs },
    { title: "Active Jobs", value: stats.activeJobs },
    { title: "Total Applications", value: stats.totalApplications },
    { title: "Accepted", value: stats.acceptedApplications },
    { title: "Rejected", value: stats.rejectedApplications },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-28 px-8 text-white">

      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-12 text-center"
      >
        Employer <span className="text-indigo-400">Dashboard</span>
      </motion.h1>

      <div className="grid md:grid-cols-3 gap-8">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl text-center"
          >
            <h2 className="text-lg text-gray-300 mb-4">
              {card.title}
            </h2>
            <p className="text-4xl font-bold text-indigo-400">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;