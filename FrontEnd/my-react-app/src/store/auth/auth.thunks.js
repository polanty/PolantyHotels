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

// SINGLE HOTEL THUNK
// DATA Retrieval Thunk: single hotel details
export const hotelDetails = createAsyncThunk(
  "auth/hotelDetails",

  async (hotelId, thunkApi) => {
    try {
      console.log("This thunk is called");

      const res = await authApi.getHotelById(hotelId);
      const payload = res.data;

      console.log("Hotel details payload:", payload);

      const hotel = payload?.data?.hotel || payload?.hotel || null;

      if (!hotel) {
        return thunkApi.rejectWithValue("Hotel details were not found");
      }

      return hotel;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Hotel details failed";

      return thunkApi.rejectWithValue(message);
    }
  },

  {
    condition: (hotelId, { getState }) => {
      const state = getState();

      const selectedHotel = state.auth.selectedHotel;
      const selectedHotelStatus = state.auth.selectedHotelStatus;

      if (selectedHotelStatus === "loading") {
        return false;
      }

      if (
        selectedHotel &&
        (selectedHotel._id === hotelId || selectedHotel.id === hotelId)
      ) {
        return false;
      }

      return true;
    },
  },
);

// DATA Retrieval Thunk
export const paginatedHotels = createAsyncThunk(
  "auth/paginatedHotels",
  async (params, thunkApi) => {
    try {
      const res = await authApi.paginatedHotels(params);
      const payload = res.data;

      return {
        hotels: payload?.data?.data?.allHotels ?? [],
        totalPages: payload?.totalPages ?? 1,
        currentPage: payload?.currentPage ?? 1,
        results: payload?.results ?? 0,
        raw: payload, // optional for debugging
      };
    } catch (err) {
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
