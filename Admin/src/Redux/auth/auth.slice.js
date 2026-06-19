import { createSlice } from "@reduxjs/toolkit";
import {
  adminLoginThunk,
  fetchMeAdmin,
  registerThunkAdmin,
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

    // REGISTER
    builder.addCase(registerThunkAdmin.pending, (state) => {
      state.authStatus = "loading";
      state.authError = null;
    });
    builder.addCase(registerThunkAdmin.fulfilled, (state, action) => {
      state.authStatus = "succeeded";
      state.user = normalizeUser(action.payload);
      state.authError = null;
    });
    builder.addCase(registerThunkAdmin.rejected, (state, action) => {
      state.authStatus = "failed";
      state.authError = action.payload || "Registration failed";
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

export const { clearAuthError, setUser } = authSliceAdmin.actions;
export default authSliceAdmin.reducer;
