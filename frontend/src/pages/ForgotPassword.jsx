import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await axios.post("/auth/forgot-password", { email });

      if (data.success) {
        toast.success("Reset link sent to your email");
      }

      setLoading(false);

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950 px-4">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
      >

        <h2 className="text-3xl font-bold text-white text-center mb-2">
          Forgot Password 🔑
        </h2>

        <p className="text-gray-400 text-center mb-6">
          Enter your email to reset your password
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        <div className="text-center mt-6">

          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            ← Back to Login
          </Link>

        </div>

      </motion.div>

    </div>
  );
};

export default ForgotPassword;