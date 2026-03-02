import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:4000/api", // Make sure this matches your backend
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token to EVERY request
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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("🔴 401 Unauthorized - Token may be expired");
      // Optionally redirect to login
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;