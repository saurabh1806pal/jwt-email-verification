import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logout()).finally(() => {
      navigate("/login", { replace: true });
    });
  }, [dispatch, navigate]);

  return <p>Logging out...</p>;
}
