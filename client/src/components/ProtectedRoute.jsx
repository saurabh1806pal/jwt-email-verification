import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // ⏳ App is still checking auth (on initial load)
  if (loading) {
    return <p>Checking authentication...</p>;
  }

  // 🔒 Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // ⏳ Authenticated but profile not loaded yet
  if (!user) {
    return <p>Loading user data...</p>;
  }

  // 🔐 User logged in but not verified
  if (!user.isAccountVerified && location.pathname !== "/verify-otp") {
    return <Navigate to="/verify-otp" replace />;
  }

  // 🚫 Block OTP page for verified users
  if (user.isAccountVerified && location.pathname === "/verify-otp") {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
