import axios from "axios";

// Get the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

console.log("🌐 API URL:", API_URL);

const instance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;