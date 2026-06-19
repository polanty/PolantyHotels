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
    console.log("This thunk is called");
    const message =
      err.response?.data?.message || err.message || "Not Authenticated";
    return thunkApi.rejectWithValue(message);
  }
});

export const registerThunkAdmin = createAsyncThunk(
  "adminAuth/register",
  async (payload, thunkApi) => {
    try {
      const res = await adminEndpoints.register(payload);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Registered failed";
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
