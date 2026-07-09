import api from "./axios";

// Adjust endpoints to match your backend
export const authApi = {
  login: (payload) => api.post("api/v1/auth/login", payload),
  register: (payload) => {
    const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;

    return api.post("api/v1/auth/signup", payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
  },
  logout: () => api.post("api/v1/auth/logout"),
  me: () => api.get("api/v1/auth/me"),
  updateProfile: (payload) => api.patch("api/v1/auth/profile", payload),
  updateEmail: (payload) => api.patch("api/v1/auth/email", payload),
  updatePassword: (payload) => api.patch("api/v1/auth/password", payload),
  deleteAccount: () => api.delete("api/v1/auth/me"),
  getMyReviews: () => api.get("api/v1/reviews/me"),
  getSuccessfulBookings: () => api.get("api/v1/bookings/successful"),

  paginatedHotels: (params, config = {}) =>
    api.get("api/v1/hotels", { params, ...config }), //If params is undefined, axios simply calls without any query string — perfect for “may or may not have any query”.
  getHotelById: (hotelId) => api.get(`api/v1/hotels/${hotelId}`),
};
