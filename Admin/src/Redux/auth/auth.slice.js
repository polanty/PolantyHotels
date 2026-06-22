import { createSlice } from "@reduxjs/toolkit";
import {
  adminLoginThunk,
  fetchBookingsByAdminThunk,
  fetchMeAdmin,
  createUserByAdminThunk,
  fetchReviewsByAdminThunk,
  fetchUserDetailsByAdminThunk,
  fetchUsersByAdminThunk,
  logoutThunkAdmin,
} from "./auth.thunk";

function normalizeUser(payload) {
  if (!payload) return null;
  if (Object.prototype.hasOwnProperty.call(payload, "user") && !payload.user) {
    return null;
  }

  const user = payload?.data?.user || payload?.user || payload?.data || payload;
  return { ...user, first_name: user.first_name || user.name || "" };
}

const initialState = {
  user: null,
  bootstrapped: false,
  authStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  authError: null,
  createdUser: null,
  createUserStatus: "idle",
  createUserError: null,
  users: [],
  usersStatus: "idle",
  usersError: null,
  usersPagination: {
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  },
  selectedUser: null,
  selectedUserBookings: [],
  selectedUserStatus: "idle",
  selectedUserError: null,
  bookings: [],
  bookingsStatus: "idle",
  bookingsError: null,
  bookingsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  },
  reviews: [],
  reviewsStatus: "idle",
  reviewsError: null,
  reviewsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 10,
  },
};

const authSliceAdmin = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.authError = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setSelectedHotel(state, action) {
      state.selectedHotel = action.payload;
    },
    clearCreateUserResult(state) {
      state.createdUser = null;
      state.createUserError = null;
      state.createUserStatus = "idle";
    },
    clearSelectedUser(state) {
      state.selectedUser = null;
      state.selectedUserBookings = [];
      state.selectedUserStatus = "idle";
      state.selectedUserError = null;
    },
  },
  extraReducers: (builder) => {
    // ME
    builder.addCase(fetchMeAdmin.pending, (state) => {
      state.authStatus = "loading";
      state.authError = null;
    });
    builder.addCase(fetchMeAdmin.fulfilled, (state, action) => {
      state.authStatus = "succeeded";
      state.user = normalizeUser(action.payload);
      state.bootstrapped = true;
    });
    builder.addCase(fetchMeAdmin.rejected, (state) => {
      state.authStatus = "idle";
      state.user = null;
      state.bootstrapped = true;
      state.authError = null;
    });

    // LOGIN
    builder.addCase(adminLoginThunk.pending, (state) => {
      state.authStatus = "loading";
      state.authError = null;
    });
    builder.addCase(adminLoginThunk.fulfilled, (state, action) => {
      state.authStatus = "succeeded";
      state.user = normalizeUser(action.payload);
      state.authError = null;
    });
    builder.addCase(adminLoginThunk.rejected, (state, action) => {
      state.authStatus = "failed";
      state.authError = action.payload || "Login failed";
    });

    // ADMIN USER CREATION
    builder.addCase(createUserByAdminThunk.pending, (state) => {
      state.createUserStatus = "loading";
      state.createUserError = null;
      state.createdUser = null;
    });
    builder.addCase(createUserByAdminThunk.fulfilled, (state, action) => {
      state.createUserStatus = "succeeded";
      state.createdUser = action.payload?.data?.user || null;
      state.createUserError = null;
      if (state.createdUser) {
        state.users = [state.createdUser, ...state.users];
      }
    });
    builder.addCase(createUserByAdminThunk.rejected, (state, action) => {
      state.createUserStatus = "failed";
      state.createUserError = action.payload || "User creation failed";
    });

    // ADMIN USER LIST
    builder.addCase(fetchUsersByAdminThunk.pending, (state) => {
      state.usersStatus = "loading";
      state.usersError = null;
    });
    builder.addCase(fetchUsersByAdminThunk.fulfilled, (state, action) => {
      state.usersStatus = "succeeded";
      state.users = action.payload?.data?.users || [];
      state.usersPagination = {
        currentPage: action.payload?.currentPage || 1,
        totalPages: action.payload?.totalPages || 1,
        totalResults: action.payload?.totalResults || 0,
        limit: action.payload?.limit || 10,
      };
      state.usersError = null;
    });
    builder.addCase(fetchUsersByAdminThunk.rejected, (state, action) => {
      state.usersStatus = "failed";
      state.usersError = action.payload || "Users failed to load";
    });

    // ADMIN SELECTED USER DETAILS
    builder.addCase(fetchUserDetailsByAdminThunk.pending, (state) => {
      state.selectedUserStatus = "loading";
      state.selectedUserError = null;
    });
    builder.addCase(
      fetchUserDetailsByAdminThunk.fulfilled,
      (state, action) => {
        state.selectedUserStatus = "succeeded";
        state.selectedUser = action.payload?.data?.user || null;
        state.selectedUserBookings = action.payload?.data?.bookings || [];
        state.selectedUserError = null;
      },
    );
    builder.addCase(fetchUserDetailsByAdminThunk.rejected, (state, action) => {
      state.selectedUserStatus = "failed";
      state.selectedUserError = action.payload || "User details failed to load";
    });

    // ADMIN BOOKINGS
    builder.addCase(fetchBookingsByAdminThunk.pending, (state) => {
      state.bookingsStatus = "loading";
      state.bookingsError = null;
    });
    builder.addCase(fetchBookingsByAdminThunk.fulfilled, (state, action) => {
      state.bookingsStatus = "succeeded";
      state.bookings = action.payload?.data?.bookings || [];
      state.bookingsPagination = {
        currentPage: action.payload?.currentPage || 1,
        totalPages: action.payload?.totalPages || 1,
        totalResults: action.payload?.totalResults || 0,
        limit: action.payload?.limit || 10,
      };
      state.bookingsError = null;
    });
    builder.addCase(fetchBookingsByAdminThunk.rejected, (state, action) => {
      state.bookingsStatus = "failed";
      state.bookingsError = action.payload || "Bookings failed to load";
    });

    // ADMIN REVIEWS
    builder.addCase(fetchReviewsByAdminThunk.pending, (state) => {
      state.reviewsStatus = "loading";
      state.reviewsError = null;
    });
    builder.addCase(fetchReviewsByAdminThunk.fulfilled, (state, action) => {
      state.reviewsStatus = "succeeded";
      state.reviews = action.payload?.data?.reviews || [];
      state.reviewsPagination = {
        currentPage: action.payload?.currentPage || 1,
        totalPages: action.payload?.totalPages || 1,
        totalResults: action.payload?.totalResults || 0,
        limit: action.payload?.limit || 10,
      };
      state.reviewsError = null;
    });
    builder.addCase(fetchReviewsByAdminThunk.rejected, (state, action) => {
      state.reviewsStatus = "failed";
      state.reviewsError = action.payload || "Reviews failed to load";
    });

    // LOGOUT
    builder.addCase(logoutThunkAdmin.fulfilled, (state) => {
      state.user = null;
      state.authStatus = "idle";
      state.authError = null;
    });
    builder.addCase(logoutThunkAdmin.rejected, (state, action) => {
      state.authStatus = "failed";
      state.authError = action.payload || "Logout failed";
    });
  },
});

export const {
  clearAuthError,
  clearCreateUserResult,
  clearSelectedUser,
  setUser,
} = authSliceAdmin.actions;
export default authSliceAdmin.reducer;
