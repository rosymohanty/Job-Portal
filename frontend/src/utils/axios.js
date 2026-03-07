import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000/api"
    : "https://your-backend-url.onrender.com/api";

const instance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token added to request:", config.url);
    } else {
      console.log("❌ No token found for request:", config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {
      console.log("🔴 401 Unauthorized - Token may be expired");
    }

    return Promise.reject(error);
  }
);

export default instance;