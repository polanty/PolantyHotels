import adminApi from "./axios.base";

adminApi.get("/api/v1/admin/hotels");
adminApi.post("/api/v1/admin/hotels", data);
adminApi.patch(`/api/v1/admin/hotels/${id}`, data);
adminApi.delete(`/api/v1/admin/hotels/${id}`);
