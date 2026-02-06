import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyAccount } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const handleSendOtp = () => {
    dispatch(sendOtp());
  };

  const handleVerify = () => {
    if (!otp) return;
    dispatch(verifyAccount(otp));
  };

  // ✅ AUTO REDIRECT WHEN AUTH STATE UPDATES
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div>
      <h2>Verify Your Account</h2>

      <button onClick={handleSendOtp} disabled={loading}>
        Send OTP to Email
      </button>

      <input
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button onClick={handleVerify} disabled={loading}>
        Verify
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
