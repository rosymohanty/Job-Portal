import React from "react"
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center text-white">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
        >
          JobPortal
        </Link>

        {/* Menu */}
        <div className="flex items-center space-x-6 text-sm font-medium">

          {/* Public */}
          {!user && (
            <>
              <NavItem to="/login" label="Login" />
              <NavItem to="/register" label="Register" />
            </>
          )}

          {/* User Menu */}
          {user?.role === "user" && (
            <>
              <NavItem to="/home" label="Jobs" />
              <NavItem to="/my-applications" label="My Applications" />
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 rounded-xl hover:bg-red-600 transition duration-300"
              >
                Logout
              </button>
            </>
          )}

          {/* Employer Menu */}
          {user?.role === "employer" && (
            <>
              <NavItem to="/employer" label="Dashboard" />
              <NavItem to="/post-job" label="Post Job" />
              <NavItem to="/my-jobs" label="My Jobs" />
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 rounded-xl hover:bg-red-600 transition duration-300"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

/* Reusable Animated Nav Item */
const NavItem = ({ to, label }) => {
  return (
    <Link to={to} className="relative group">
      {label}
      <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
};

export default Navbar;