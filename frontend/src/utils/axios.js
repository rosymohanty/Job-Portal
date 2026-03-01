import axios from "axios";
import toast from "react-hot-toast";

// Use env or fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,  // This will now point to your backend
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || "Something went wrong";

    // Auto logout if token expired
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Don't show toast for 404 errors (handled separately)
    if (error.response?.status !== 404) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;