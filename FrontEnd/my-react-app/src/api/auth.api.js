import api from "./axios";

// Adjust endpoints to match your backend
export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};
