import React from "react"
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

function App() {
  return (
    <>
      <Navbar />
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

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
          path="/employer"
          element={
            <ProtectedRoute allowedRole="employer">
              <EmployerDashboard />
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

        <Route
          path="/post-job"
          element={
            <ProtectedRoute allowedRole="employer">
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route path="/view-applicants/:id" element={<ViewApplicants />} />
        <Route
  path="/employer/dashboard"
  element={<DashboardOverview />}
/>
          <Route path="/saved-jobs" element={<SavedJobs />} />
      <Route
  path="/upload-resume"
  element={
    <ProtectedRoute allowedRole="user">
      <ResumeUpload />
    </ProtectedRoute>
  }
/>
</Routes>
    </>
  );
}

export default App;