import axios from "axios";
import toast from "react-hot-toast";

// ✅ Backend URL
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000"
    : import.meta.env.VITE_API_URL || "https://job-portal-jtt0.onrender.com";

// ✅ Axios Instance
const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach Token Automatically
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

// 🌍 Global Error Handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message =
        error.response.data?.message || "Something went wrong";

      toast.error(message);

      // If token expired
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } else {
      toast.error("Network error. Backend might be sleeping.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;