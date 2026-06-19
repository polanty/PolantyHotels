import axios from "axios";

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Optional: normalize errors
adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error("Network error. Check API/CORS."));
    }
    const data = error.response.data;
    const msg =
      (typeof data === "string" ? data : null) ||
      data?.message ||
      data?.error ||
      `Request failed (${error.response.status})`;

    // preserve the original axios error (and its `response`) but normalize the message
    error.message = msg;
    return Promise.reject(error);
  },
);

export default adminApi;
