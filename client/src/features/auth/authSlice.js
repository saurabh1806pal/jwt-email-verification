import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authAPI from "./authAPI";

/* ─────────────────────────────────────────────
   ASYNC THUNKS
   ───────────────────────────────────────────── */

export const register = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const res = await authAPI.registerUser(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const res = await authAPI.loginUser(credentials);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Login failed",
      );
    }
  },
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, thunkAPI) => {
    try {
      const res = await authAPI.checkAuth();
      return res.data;
    } catch {
      return thunkAPI.rejectWithValue("Not authenticated");
    }
  },
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const res = await authAPI.getUserProfile();
      return res.data.user;
    } catch {
      return thunkAPI.rejectWithValue("Failed to fetch profile");
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await authAPI.logoutUser();
    return true;
  } catch {
    return thunkAPI.rejectWithValue("Logout failed");
  }
});

export const sendOtp = createAsyncThunk("auth/sendOtp", async (_, thunkAPI) => {
  try {
    const res = await authAPI.sendVerifyOtp();
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to send OTP",
    );
  }
});

export const verifyAccount = createAsyncThunk(
  "auth/verifyAccount",
  async (otp, thunkAPI) => {
    try {
      const res = await authAPI.verifyOtp(otp);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "OTP verification failed",
      );
    }
  },
);
/* Send reset password OTP */
export const sendPasswordResetOtp = createAsyncThunk(
  "auth/sendPasswordResetOtp",
  async (email, thunkAPI) => {
    try {
      const res = await authAPI.sendResetOtp(email);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to send reset OTP",
      );
    }
  },
);

/* Reset password */
export const resetUserPassword = createAsyncThunk(
  "auth/resetUserPassword",
  async (data, thunkAPI) => {
    try {
      const res = await authAPI.resetPassword(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Password reset failed",
      );
    }
  },
);

/* ─────────────────────────────────────────────
   SLICE
   ───────────────────────────────────────────── */

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* Register */
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* Login */
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* Check Auth */
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload?.user || null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })

      /* Fetch Profile */
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })

      /* Logout */
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })

      /* OTP FLOW (🔥 FIXED) */
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(verifyAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true; // ✅ CRITICAL FIX
        state.user = action.payload?.user || null;
      })
      .addCase(verifyAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendPasswordResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPasswordResetOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendPasswordResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
