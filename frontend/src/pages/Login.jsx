import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Determine if this is an employer login attempt
      const isEmployerLogin = form.email.includes('employer') || false; // You might want a better way to detect

      const endpoint = isEmployerLogin ? "/auth/login-employer" : "/auth/login";
      
      const { data } = await axios.post(endpoint, form);

      if (data.success) {
        // Save token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success(data.message || "Login successful 🚀");

        // Role-based redirect
        if (data.user.role === "employer") {
          navigate("/employer/dashboard");
        } else if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/home");
        }
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific error messages
      const errorMessage = error.response?.data?.message;
      
      if (errorMessage?.includes("pending admin approval")) {
        toast.error("Your employer account is pending admin approval");
        // Optionally show a modal or redirect to pending page
      } else if (errorMessage?.includes("Invalid credentials")) {
        setErrors({
          email: "Invalid email or password",
          password: "Invalid email or password"
        });
        toast.error("Invalid email or password");
      } else if (errorMessage?.includes("not approved")) {
        toast.error("Your account has not been approved yet");
      } else {
        toast.error(errorMessage || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes - quick fill credentials
  const fillDemoCredentials = (role) => {
    if (role === "user") {
      setForm({
        email: "user@example.com",
        password: "password123",
      });
    } else if (role === "employer") {
      setForm({
        email: "employer@company.com",
        password: "password123",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-20 px-4 pb-8">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md text-white"
      >
        <h2 className="text-3xl font-bold text-center mb-2">
          Welcome Back! 👋
        </h2>
        <p className="text-center text-gray-400 mb-6">
          Sign in to continue your journey
        </p>

        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            className={`w-full p-3 rounded-xl bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.email ? 'border-2 border-red-500' : ''
            }`}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-6 relative">
          <label className="block text-sm text-gray-400 mb-2">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className={`w-full p-3 rounded-xl bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 pr-12 ${
              errors.password ? 'border-2 border-red-500' : ''
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 bottom-3 text-gray-400 hover:text-white"
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right mb-6">
  <Link
    to="/forgot-password"
    className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline"
  >
    Forgot Password?
  </Link>
</div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>

        {/* Demo Credentials (for testing) */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-center text-gray-500 mb-3">
            Demo Credentials (for testing)
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => fillDemoCredentials("user")}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition"
            >
              👤 Job Seeker
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials("employer")}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition"
            >
              🏢 Employer
            </button>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm mt-6 text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium">
            Create one now
          </Link>
        </p>

        {/* Back to Home */}
        <Link
          to="/"
          className="block text-center text-xs text-gray-500 mt-4 hover:text-gray-400 transition"
        >
          ← Back to Home
        </Link>
      </motion.form>
    </div>
  );
};

export default Login;