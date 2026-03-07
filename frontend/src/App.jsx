import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import JobDetails from "./pages/JobDetails";
import MyApplications from "./pages/MyApplications";
import EmployerDashboard from "./pages/EmployerDashboard";
import MyPostedJobs from "./pages/MyPostedJobs";
import PostJob from "./pages/PostJob";
import ViewApplicants from "./pages/ViewApplicants";
import DashboardOverview from "./pages/DashboardOverview";
import SavedJobs from "./pages/SavedJobs";
import ResumeUpload from "./pages/ResumeUpload";
import EditJob from "./pages/EditJob";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import EmployerProfile from "./pages/EmployerProfile";
import UserProfile from "./pages/UserProfile";
import EditProfile from "./pages/EditProfile";
function App() {

  return (
    <>

      <Navbar />

      <Toaster position="top-right" />

      <Routes>

        {/* Public Routes */}

        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* User Routes */}

        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRole="user">
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job/:id"
          element={
            <ProtectedRoute allowedRole="user">
              <JobDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-applications"
          element={
            <ProtectedRoute allowedRole="user">
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload-resume"
          element={
            <ProtectedRoute allowedRole="user">
              <ResumeUpload />
            </ProtectedRoute>
          }
        />

        <Route path="/saved-jobs" element={<SavedJobs />} />

        {/* Employer Routes */}

        <Route
          path="/employer"
          element={
            <ProtectedRoute allowedRole="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/dashboard"
          element={<DashboardOverview />}
        />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute allowedRole="employer">
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute allowedRole="employer">
              <MyPostedJobs />
            </ProtectedRoute>
          }
        />

        <Route path="/view-applicants/:id" element={<ViewApplicants />} />

        <Route path="/edit-job/:id" element={<EditJob />} />

        {/* Auth */}

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin */}

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route
  path="/employer/profile"
  element={
    <ProtectedRoute allowedRole="employer">
      <EmployerProfile />
    </ProtectedRoute>
  }
/>
<Route
  path="/profile"
  element={
    <ProtectedRoute allowedRole="user">
      <UserProfile />
    </ProtectedRoute>
  }
/>

<Route
  path="/profile/edit"
  element={
    <ProtectedRoute allowedRole="user">
      <EditProfile />
    </ProtectedRoute>
  }
/>

      </Routes>

    </>
  );

}

export default App;