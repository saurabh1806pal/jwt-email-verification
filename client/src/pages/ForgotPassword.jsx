import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendPasswordResetOtp } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async () => {
    const res = await dispatch(sendPasswordResetOtp(email));
    if (res.meta.requestStatus === "fulfilled") {
      navigate("/reset-password", { state: { email } });
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>

      <input
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Sending OTP..." : "Send OTP"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
