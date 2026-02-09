import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../api/auth.api";

// Hydrate user from cookie session
export const fetchMe = createAsyncThunk("auth/me", async (_, thunkApi) => {
  try {
    const res = await authApi.me();
    return res.data; // expected: { user: {...} } OR just user
  } catch (err) {
    // If not logged in, treat as "no user" not "fatal error"
    console.log("This thunk is called");
    const message =
      err.response?.data?.message || err.message || "Not Authenticated";
    return thunkApi.rejectWithValue(message);
  }
});

// Pass in the returned Hotels into the paginatedHotels
export const paginatedHotels = createAsyncThunk(
  "auth/paginatedHotels",
  async (payload, thunkApi) => {
    try {
      const res = await authApi.paginatedHotels();
      return res.data; // received data of Hotels paginated from back end
    } catch (err) {
      // Return Error
      console.log("This thunk is called");
      const message =
        err.response?.data?.message || err.message || "Hotels failed";
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload, thunkApi) => {
    try {
      const res = await authApi.login(payload);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed";
      console.log(err.response);
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload, thunkApi) => {
    try {
      const res = await authApi.register(payload);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Registered failed";
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, thunkApi) => {
    try {
      await authApi.logout();
      return true;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Log out failed";
      return thunkApi.rejectWithValue(message);
    }
  },
);
