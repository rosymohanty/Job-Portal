import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/auth/register", form);
      toast.success("Registration successful 🎉");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4">

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md text-white"
      >
        <h2 className="text-3xl font-bold text-center mb-6">
          Create Account ✨
        </h2>

        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 rounded-xl bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 rounded-xl bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 rounded-xl bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Role Select */}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-3 mb-6 rounded-xl bg-white/20 text-white outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="user" className="text-black">
            User
          </option>
          <option value="employer" className="text-black">
            Employer
          </option>
        </select>

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-700 hover:scale-105 transition duration-300"
        >
          Register
        </button>

        {/* Login Link */}
        <p className="text-center text-sm mt-6 text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default Register;