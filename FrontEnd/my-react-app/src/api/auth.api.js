import api from "./axios";

// Adjust endpoints to match your backend
export const authApi = {
  login: (payload) => api.post("api/v1/auth/login", payload),
  register: (payload) => api.post("api/v1/auth/signup", payload),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("api/v1/auth/me"),

  paginatedHotels: (params) => api.get("api/v1/hotels", { params }), //If params is undefined, axios simply calls without any query string — perfect for “may or may not have any query”.
  getHotelById: (hotelId) => api.get(`api/v1/hotels/${hotelId}`),
};
