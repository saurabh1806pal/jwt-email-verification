import axios from "axios";

/**
 * Axios instance
 * - withCredentials: allows HTTP-only cookies (JWT)
 * - baseURL: backend API root
 */
const API = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

/* ─────────────────────────────────────────────
   AUTH: REGISTER / LOGIN / LOGOUT
   ───────────────────────────────────────────── */

export const registerUser = (userData) => API.post("/auth/register", userData);

export const loginUser = (credentials) => API.post("/auth/login", credentials);

export const logoutUser = () => API.post("/auth/logout");

/* ─────────────────────────────────────────────
   AUTH: SESSION & USER
   ───────────────────────────────────────────── */

export const checkAuth = () => API.post("/auth/is-auth");

export const getUserProfile = () => API.get("/user/profile");

/* ─────────────────────────────────────────────
   ACCOUNT VERIFICATION (OTP)
   ───────────────────────────────────────────── */

export const sendVerifyOtp = () => API.post("/auth/send-verify-otp");

export const verifyOtp = (otp) => API.post("/auth/verify-otp", { otp });

/* ─────────────────────────────────────────────
   PASSWORD RESET
   ───────────────────────────────────────────── */

export const sendResetOtp = (email) =>
  API.post("/auth/reset-password-otp", { email });

export const resetPassword = ({ email, otp, newPassword }) =>
  API.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });

/* ─────────────────────────────────────────────
   EXPORT AXIOS INSTANCE (OPTIONAL)
   Useful for future features (admin, courses, etc.)
   ───────────────────────────────────────────── */

export default API;
