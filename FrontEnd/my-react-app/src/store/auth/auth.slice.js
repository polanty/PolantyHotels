import { createSlice } from "@reduxjs/toolkit";
import {
  fetchMe,
  loginThunk,
  logoutThunk,
  registerThunk,
  paginatedHotels,
  hotelDetails,
} from "./auth.thunks";

function normalizeUser(payload) {
  if (!payload) return null;
  const user = payload.data || payload;
  return { ...user, first_name: user.first_name || user.name || "" };
}

const initialState = {
  user: null,
  data: null,

  status: "idle", // idle | loading | succeeded | failed
  bootstrapped: false, // ✅ so routes know when /me check finished
  error: null,

  //states for single Hotel
  selectedHotel: null,
  selectedHotelStatus: "idle",
  selectedHotelError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setData(state, action) {
      state.data = action.payload;
    },
    setSelectedHotel(state, action) {
      state.selectedHotel = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ME
    builder.addCase(fetchMe.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.user = normalizeUser(action.payload);
      state.bootstrapped = true; // bootstrap complete
    });
    builder.addCase(fetchMe.rejected, (state) => {
      state.status = "idle";
      state.user = null; // not logged in
      state.bootstrapped = true;
      state.error = null; // don't show "not logged in" as an error
    });

    // DATA
    builder.addCase(paginatedHotels.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(paginatedHotels.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.data = action.payload.hotels;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.results = action.payload.results;
      state.error = null;
    });
    builder.addCase(paginatedHotels.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to Load Hotels";
    });

    // SINGLE HOTEL DETAILS
    builder.addCase(hotelDetails.pending, (state) => {
      state.selectedHotelStatus = "loading";
      state.selectedHotelError = null;
    });

    builder.addCase(hotelDetails.fulfilled, (state, action) => {
      state.selectedHotelStatus = "succeeded";
      state.selectedHotel = action.payload;
      state.selectedHotelError = null;
    });

    builder.addCase(hotelDetails.rejected, (state, action) => {
      state.selectedHotelStatus = "failed";
      state.selectedHotelError =
        action.payload || "Failed to load hotel details";

      if (!state.selectedHotel) {
        state.selectedHotel = null;
      }
    });

    // LOGIN
    builder.addCase(loginThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.user = normalizeUser(action.payload);
      state.error = null;
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Login failed";
    });

    // REGISTER
    builder.addCase(registerThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(registerThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.user = normalizeUser(action.payload);
      state.error = null;
    });
    builder.addCase(registerThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Registration failed";
    });

    // LOGOUT
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.status = "idle";
      state.error = null;
    });
    builder.addCase(logoutThunk.rejected, (state, action) => {
      state.error = action.payload || "Logout failed";
    });
  },
});

export const { clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;
