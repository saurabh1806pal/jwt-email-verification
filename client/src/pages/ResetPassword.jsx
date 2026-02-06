import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetUserPassword } from "../features/auth/authSlice";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { loading, error } = useSelector((state) => state.auth);

  const handleReset = async () => {
    const res = await dispatch(resetUserPassword({ email, otp, newPassword }));

    if (res.meta.requestStatus === "fulfilled") {
      navigate("/login");
    }
  };

  if (!email) return <p>Invalid reset request</p>;

  return (
    <div>
      <h2>Reset Password</h2>

      <input
        placeholder="OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <button disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
