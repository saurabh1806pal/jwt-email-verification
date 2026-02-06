import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },

  // Optional: good defaults, safe to keep
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // avoids issues with navigation state, errors, etc.
    }),

  devTools: process.env.NODE_ENV !== "production",
});

export default store;
