import { configureStore } from "@reduxjs/toolkit";
import authSliceAdmin from "../Redux/auth/auth.slice";

export const store = configureStore({
  reducer: {
    authAdmin: authSliceAdmin,
  },
});

// Optional typed helpers later if you use TS
