import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ResumeUpload = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [currentResume, setCurrentResume] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setCurrentResume(parsedUser.resume || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/rtf',
        'text/plain'
      ];
      
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.rtf', '.txt'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        toast.error("Please upload PDF, DOC, DOCX, RTF, or TXT file only");
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setResumeFile(file);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);

    setLoading(true);
    setUploadProgress(0);

    try {
      const { data } = await axios.post("/auth/upload-resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (data.success) {
        toast.success("Resume uploaded successfully! 🎉");
        
        // Update user in localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          user.resume = data.resumePath;
          localStorage.setItem("user", JSON.stringify(user));
          setCurrentResume(data.resumePath);
          setUser(user);
        }
        
        // Reset file input
        setResumeFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        setUploadProgress(0);
        
        // Show success message and navigate back after 2 seconds
        setTimeout(() => {
          toast.success("Redirecting back...");
          navigate(-1);
        }, 2000);
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else if (error.response?.status === 413) {
        toast.error("File too large. Maximum size is 5MB");
      } else {
        toast.error(error.response?.data?.message || "Failed to upload resume");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm("Are you sure you want to remove your resume?")) return;
    
    try {
      // You would need a delete endpoint in your backend
      // For now, just update localStorage
      
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        delete user.resume;
        localStorage.setItem("user", JSON.stringify(user));
        setCurrentResume("");
        setUser(user);
        toast.success("Resume removed successfully");
      }
    } catch (error) {
      console.error("Error removing resume:", error);
      toast.error("Failed to remove resume");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 pt-24 px-4 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
        </button>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Upload Resume</h1>
            <span className="text-4xl">📄</span>
          </div>
          <p className="text-gray-400 mb-8">
            Upload your resume to apply for jobs. Supported formats: PDF, DOC, DOCX, RTF, TXT (Max 5MB)
          </p>

          {/* Current Resume */}
          {currentResume && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-400 font-medium mb-2 flex items-center gap-2">
                    <span>✓</span> Current Resume Uploaded
                  </p>
                  <p className="text-sm text-gray-400 mb-3">
                    File: {currentResume.split('/').pop() || 'resume.pdf'}
                  </p>
                  <a
                    href={`http://localhost:4000${currentResume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 text-sm inline-flex items-center gap-1 transition-colors"
                  >
                    <span>📄</span> View Resume →
                  </a>
                </div>
                <button
                  onClick={handleDeleteResume}
                  className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-500/10 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          )}

          {/* Upload New Resume */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Resume File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.rtf,.txt"
                onChange={handleFileChange}
                className="w-full p-3 rounded-xl bg-white/10 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-colors cursor-pointer"
              />
            </div>
            
            {resumeFile && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-indigo-500/10 rounded-lg"
              >
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300 truncate max-w-[200px]">
                    {resumeFile.name}
                  </span>
                  <span className="text-gray-400">
                    {formatFileSize(resumeFile.size)}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading || !resumeFile}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </span>
            ) : (
              "Upload Resume"
            )}
          </button>

          {/* Info Message */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-400 text-sm flex items-start gap-2">
              <span className="text-lg">ℹ️</span>
              <span>
                <span className="font-bold">Note:</span> You need to upload a resume before you can apply for jobs. 
                Your resume will be attached to all your job applications.
              </span>
            </p>
          </div>

          {/* Quick Tips */}
          <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
            <p className="text-indigo-400 text-sm flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                <span className="font-bold">Tips:</span> Use a clear filename (e.g., "John_Doe_Resume.pdf"). 
                Keep your resume updated and under 5MB for best results.
              </span>
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate("/home")}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              Go to Jobs
            </button>
            <button
              onClick={() => navigate("/my-applications")}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              My Applications
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResumeUpload;