import axios from "axios";
import toast from "react-hot-toast";

// Force fallback if env missing
const BASE_URL =
  import.meta.env.VITE_API_URL || "https://job-portal-jtt0.onrender.com";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || "Something went wrong";
    toast.error(message);
    return Promise.reject(error);
  }
);

export default axiosInstance;