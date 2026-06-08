import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { parseUserFromToken } from "../utils/jwt";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const user = parseUserFromToken(token); // ← справжні email + role з токена
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    login(token, user);
    navigate("/", { replace: true });
  }, [navigate, login]);

  return <p style={{ textAlign: "center", marginTop: 40 }}>Входимо...</p>;
}