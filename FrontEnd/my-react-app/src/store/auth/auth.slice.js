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
  bootstrapped: false,

  authStatus: "idle",
  authError: null,

  hotels: [],
  hotelsStatus: "idle",
  hotelsError: null,
  hotelsRequestId: null,
  totalPages: 1,
  currentPage: 1,
  results: 0,

  selectedHotel: null,
  selectedHotelStatus: "idle",
  selectedHotelError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.authError = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setData(state, action) {
      state.hotels = action.payload;
    },
    setSelectedHotel(state, action) {
      state.selectedHotel = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ME
    builder.addCase(fetchMe.pending, (state) => {
      state.authStatus = "loading";
      state.authError = null;
    });
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.authStatus = "succeeded";
      state.user = normalizeUser(action.payload);
      state.bootstrapped = true;
    });
    builder.addCase(fetchMe.rejected, (state) => {
      state.authStatus = "idle";
      state.user = null;
      state.bootstrapped = true;
      state.authError = null;
    });

    // DATA
    builder.addCase(paginatedHotels.pending, (state, action) => {
      state.hotelsStatus = "loading";
      state.hotelsError = null;
      state.hotelsRequestId = action.meta.requestId;
    });
    builder.addCase(paginatedHotels.fulfilled, (state, action) => {
      if (state.hotelsRequestId !== action.meta.requestId) return;

      state.hotelsStatus = "succeeded";
      state.hotels = action.payload.hotels;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.results = action.payload.results;
      state.hotelsError = null;
      state.hotelsRequestId = null;
    });
    builder.addCase(paginatedHotels.rejected, (state, action) => {
      if (state.hotelsRequestId !== action.meta.requestId) return;

      state.hotelsRequestId = null;

      if (action.meta.aborted || action.payload === null) {
        state.hotelsStatus = "idle";
        state.hotelsError = null;
        return;
      }

      state.hotelsStatus = "failed";
      state.hotelsError = action.payload || "Failed to Load Hotels";
    });

    // SINGLE HOTEL DETAILS
    builder.addCase(hotelDetails.pending, (state) => {
      state.selectedHotelStatus = "loading";
      state.selectedHotelError = null;
      state.selectedHotel = null;
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

      // if (!state.selectedHotel) {
      //   state.selectedHotel = null;
      // }
    });

    // LOGIN
    builder.addCase(loginThunk.pending, (state) => {
      state.authStatus = "loading";
      state.authError = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.authStatus = "succeeded";
      state.user = normalizeUser(action.payload);
      state.authError = null;
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.authStatus = "failed";
      state.authError = action.payload || "Login failed";
    });

    // REGISTER
    builder.addCase(registerThunk.pending, (state) => {
      state.authStatus = "loading";
      state.authError = null;
    });
    builder.addCase(registerThunk.fulfilled, (state, action) => {
      state.authStatus = "succeeded";
      state.user = normalizeUser(action.payload);
      state.authError = null;
    });
    builder.addCase(registerThunk.rejected, (state, action) => {
      state.authStatus = "failed";
      state.authError = action.payload || "Registration failed";
    });

    // LOGOUT
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.authStatus = "idle";
      state.authError = null;
    });
    builder.addCase(logoutThunk.rejected, (state, action) => {
      state.authStatus = "failed";
      state.authError = action.payload || "Logout failed";
    });
  },
});

export const { clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;
