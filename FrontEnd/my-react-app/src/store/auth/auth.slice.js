import { createSlice } from "@reduxjs/toolkit";
import { fetchMe, loginThunk, logoutThunk, registerThunk } from "./auth.thunks";

function normalizeUser(payload) {
  // Supports APIs returning { user: ... } or just user
  if (!payload) return null;
  if (payload.user) return payload.user;
  return payload;
}

const initialState = {
  user: null,
  status: "idle", // idle | loading | succeeded | failed
  bootstrapped: false, // ✅ so routes know when /me check finished
  error: null,
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
      state.bootstrapped = true;
    });
    builder.addCase(fetchMe.rejected, (state) => {
      state.status = "idle";
      state.user = null; // not logged in
      state.bootstrapped = true;
      state.error = null; // don't show "not logged in" as an error
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
