import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminEndpoints } from "../../axios/axios.endpoint";

export const adminLoginThunk = createAsyncThunk(
  "adminAuth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await adminEndpoints.login(credentials);
      const user = response.data?.data?.user;

      if (user?.role !== "admin") {
        return rejectWithValue("You are not authorised to access admin.");
      }

      return response.data;
    } catch (error) {
      // console.error("Admin login error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Admin login failed",
      );
    }
  },
);

export const fetchMeAdmin = createAsyncThunk("auth/me", async (_, thunkApi) => {
  try {
    const res = await adminEndpoints.me();
    return res.data; // expected: { user: {...} } OR just user
  } catch (err) {
    // If not logged in, treat as "no user" not "fatal error"
    const message =
      err.response?.data?.message || err.message || "Not Authenticated";
    return thunkApi.rejectWithValue(message);
  }
});

export const createUserByAdminThunk = createAsyncThunk(
  "adminAuth/createUser",
  async (payload, thunkApi) => {
    try {
      const res = await adminEndpoints.createUser(payload);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "User creation failed";
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const fetchUsersByAdminThunk = createAsyncThunk(
  "adminAuth/fetchUsers",
  async (params = {}, thunkApi) => {
    try {
      const res = await adminEndpoints.getUsers(params);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Users failed to load";
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const fetchUserDetailsByAdminThunk = createAsyncThunk(
  "adminAuth/fetchUserDetails",
  async (userId, thunkApi) => {
    try {
      const res = await adminEndpoints.getUser(userId);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "User details failed to load";
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const fetchBookingsByAdminThunk = createAsyncThunk(
  "adminAuth/fetchBookings",
  async (params = {}, thunkApi) => {
    try {
      const res = await adminEndpoints.getBookings(params);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Bookings failed to load";
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const fetchReviewsByAdminThunk = createAsyncThunk(
  "adminAuth/fetchReviews",
  async (params = {}, thunkApi) => {
    try {
      const res = await adminEndpoints.getReviews(params);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Reviews failed to load";
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const logoutThunkAdmin = createAsyncThunk(
  "adminAuth/logout",
  async (_, thunkApi) => {
    try {
      await adminEndpoints.logout();
      return true;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Log out failed";
      return thunkApi.rejectWithValue(message);
    }
  },
);
