import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: authLogin } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      alert("Помилка авторизації через Google");
      navigate("/login");
      return;
    }

    if (token) {
      localStorage.setItem("token", token);
      authLogin(token, { id: "", nickname: "Google User", email: "", rating: 1000, role: "Player" });
      navigate("/dashboard");
    } else {
      alert("Не вдалося отримати токен");
      navigate("/login");
    }
  }, [searchParams, navigate, authLogin]);

  return (
    <div className="page-loading">
      <div className="loading-spinner"></div>
      <p>Завершення авторизації...</p>
    </div>
  );
}