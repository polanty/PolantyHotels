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
  getBrands: (params) => adminApi.get("api/v1/brands", { params }),
  createBrand: (data) => adminApi.post("api/v1/brands", data),
  getAmenities: () => adminApi.get("api/v1/admin/amenities"),
  createAmenities: (data) => adminApi.post("api/v1/admin/amenities", data),
  getHotels: (params) => adminApi.get("api/v1/hotels", { params }),
  createHotel: (data) => adminApi.post("api/v1/hotels", data),
  updateHotel: (id, data) => adminApi.patch(`api/v1/hotels/${id}`, data),
  deleteHotel: (id) => adminApi.delete(`api/v1/hotels/${id}`),
  createRoomType: (data) => adminApi.post("api/v1/room-types", data),
  createPricing: (data) => adminApi.post("api/v1/admin/pricing", data),
  createRoom: (data) =>
    adminApi.post("api/v1/rooms", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
