import axios from "axios";
import toast from "react-hot-toast";

// ✅ Environment-based API URL
const API =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000"
    : import.meta.env.VITE_API_URL;

// ✅ Create Axios Instance
const instance = axios.create({
  baseURL: `${API}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Request Interceptor (Attach Token Automatically)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Response Interceptor (Global Error Handling)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 🔴 Unauthorized (Token Expired)
      if (error.response.status === 401) {
        localStorage.clear();
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
      }

      // 🔴 Server Error
      if (error.response.status === 500) {
        toast.error("Server error. Please try again later.");
      }
    } else {
      // 🔴 Network Error
      toast.error("Network error. Check your connection.");
    }

    return Promise.reject(error);
  }
);

export default instance;