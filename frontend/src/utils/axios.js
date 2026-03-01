import axios from "axios";
import toast from "react-hot-toast";

// Use env or fallback
const BASE_URL =
  import.meta.env.VITE_API_URL || "https://job-portal-jtt0.onrender.com";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
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
      window.location.href = "/login";
    }

    toast.error(message);
    return Promise.reject(error);
  }
);

export default axiosInstance;