import adminApi from "./axios.base";

export const adminEndpoints = {
  //Authentication
  login: (data) => adminApi.post("api/v1/auth/login", data),
  me: () => adminApi.get("api/v1/auth/me"),
  // register: (data) => adminApi.post("api/v1/auth/signup", data),
  logout: () => adminApi.post("api/v1/auth/logout"),

  //User CRUD end Points
  getUsers: (params) => adminApi.get("api/v1/admin/users", { params }),
  createUser: (data) => adminApi.post("api/v1/admin/users", data),
  getUser: (id) => adminApi.get(`api/v1/admin/users/${id}`),
  updateUser: (id, data) => adminApi.put(`api/v1/admin/users/${id}`, data),
  deleteUser: (id) => adminApi.delete(`api/v1/admin/users/${id}`),
  getBookings: (params) => adminApi.get("api/v1/admin/bookings", { params }),
  getReviews: (params) => adminApi.get("api/v1/admin/reviews", { params }),

  //Hotel CRUD end Points
  getHotels: () => adminApi.get("/api/v1/admin/hotels"),
  createHotel: (data) => adminApi.post("/api/v1/admin/hotels", data),
  updateHotel: (id, data) => adminApi.patch(`/api/v1/admin/hotels/${id}`, data),
  deleteHotel: (id) => adminApi.delete(`/api/v1/admin/hotels/${id}`),
};
