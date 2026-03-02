import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    // Employer fields
    companyName: "",
    companyWebsite: "",
    companyLocation: "",
    phone: "",
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

    // Name validation (for both user and employer)
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Employer-specific validations
    if (form.role === "employer") {
      if (!form.companyName?.trim()) {
        newErrors.companyName = "Company name is required";
      }
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
      const endpoint = form.role === "employer" 
        ? "/auth/register-employer" 
        : "/auth/register";

      // Prepare data based on role
      const submitData = form.role === "employer" 
        ? {
            name: form.name,
            email: form.email,
            password: form.password,
            companyName: form.companyName,
            companyWebsite: form.companyWebsite || undefined,
            companyLocation: form.companyLocation || undefined,
            phone: form.phone || undefined,
          }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
            role: "user",
          };

      console.log("Submitting data:", submitData);

      const { data } = await axios.post(endpoint, submitData);

      if (data.success) {
        if (form.role === "employer") {
          toast.success(data.message || "Registration successful! Please wait for admin approval.");
          // Store email for pre-fill on login
          localStorage.setItem("pendingApprovalEmail", form.email);
        } else {
          toast.success(data.message || "Registration successful! 🎉");
        }
        navigate("/login");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message;
      
      if (errorMessage?.includes("already exists")) {
        setErrors({ email: "Email already registered" });
        toast.error("Email already registered");
      } else if (errorMessage?.includes("company name")) {
        setErrors({ companyName: "Company name is required" });
        toast.error("Company name is required");
      } else if (errorMessage?.includes("password")) {
        toast.error("Password must be at least 6 characters");
      } else {
        toast.error(errorMessage || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fill demo data for testing
  const fillDemoData = (role) => {
    if (role === "user") {
      setForm({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
        companyName: "",
        companyWebsite: "",
        companyLocation: "",
        phone: "",
      });
    } else if (role === "employer") {
      setForm({
        name: "Jane Smith",
        email: "jane@company.com",
        password: "password123",
        role: "employer",
        companyName: "Tech Corp",
        companyWebsite: "https://techcorp.com",
        companyLocation: "San Francisco, CA",
        phone: "+1 234 567 8900",
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
          Create Account ✨
        </h2>
        <p className="text-center text-gray-400 mb-6">
          Join thousands of job seekers and employers
        </p>

        {/* Name Field */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            className={`w-full p-3 rounded-xl bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.name ? 'border-2 border-red-500' : ''
            }`}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Email Address <span className="text-red-400">*</span>
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
        <div className="mb-4 relative">
          <label className="block text-sm text-gray-400 mb-2">
            Password <span className="text-red-400">*</span>
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Minimum 6 characters"
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

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-3">
            I want to register as:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                form.role === "user"
                  ? "bg-indigo-600 border-indigo-400"
                  : "bg-white/10 border-white/20 hover:bg-white/20"
              } border`}
            >
              <input
                type="radio"
                name="role"
                value="user"
                checked={form.role === "user"}
                onChange={handleChange}
                className="hidden"
              />
              <span className="text-2xl">👤</span>
              <span>Job Seeker</span>
            </label>
            
            <label
              className={`flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                form.role === "employer"
                  ? "bg-indigo-600 border-indigo-400"
                  : "bg-white/10 border-white/20 hover:bg-white/20"
              } border`}
            >
              <input
                type="radio"
                name="role"
                value="employer"
                checked={form.role === "employer"}
                onChange={handleChange}
                className="hidden"
              />
              <span className="text-2xl">🏢</span>
              <span>Employer</span>
            </label>
          </div>
        </div>

        {/* Employer Additional Fields */}
        {form.role === "employer" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="space-y-4 mb-6"
          >
            {/* Company Name (Required) */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                placeholder="Enter your company name"
                value={form.companyName}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.companyName ? 'border-2 border-red-500' : ''
                }`}
              />
              {errors.companyName && (
                <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>
              )}
            </div>

            {/* Company Website (Optional) */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Company Website <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="url"
                name="companyWebsite"
                placeholder="https://example.com"
                value={form.companyWebsite}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Company Location (Optional) */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Company Location <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                name="companyLocation"
                placeholder="City, Country"
                value={form.companyLocation}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Phone Number <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+1 234 567 8900"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white/20 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </motion.div>
        )}

        {/* Info Message for Employers */}
        {form.role === "employer" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-sm"
          >
            <p className="text-yellow-400 flex items-start gap-2">
              <span className="text-lg">ℹ️</span>
              <span>
                <strong>Employer accounts require admin approval.</strong>
                <br />
                <span className="text-yellow-400/80">
                  You'll be able to post jobs once your account is verified by our team.
                  This usually takes 24-48 hours.
                </span>
              </span>
            </p>
          </motion.div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>

        {/* Demo Accounts (for testing) */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-center text-gray-500 mb-3">
            Quick fill for testing
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => fillDemoData("user")}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
            >
              <span>👤</span> Job Seeker
            </button>
            <button
              type="button"
              onClick={() => fillDemoData("employer")}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
            >
              <span>🏢</span> Employer
            </button>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm mt-6 text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium">
            Sign In
          </Link>
        </p>

        {/* Back to Home */}
        <Link
          to="/"
          className="block text-center text-xs text-gray-500 mt-4 hover:text-gray-400 transition"
        >
          ← Back to Home
        </Link>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 mt-4">
          By registering, you agree to our{" "}
          <a href="/terms" className="text-indigo-400 hover:underline">Terms</a>{" "}
          and{" "}
          <a href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>
        </p>
      </motion.form>
    </div>
  );
};

export default Register;