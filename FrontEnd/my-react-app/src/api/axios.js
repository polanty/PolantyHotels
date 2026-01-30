import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true, // ✅ always send cookies
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Optional: normalize errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error("Network error. Check API/CORS."));
    }
    const msg =
      error.response.data?.message ||
      error.response.data?.error ||
      `Request failed (${error.response.status})`;
    return Promise.reject(new Error(msg));
  },
);

export default api;
