import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { login } from "../services/authService";

export default function LoginPage() {
  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin =
    async () => {
      try {
        const result =
          await login({
            email,
            password
          });

        localStorage.setItem(
          "token",
          result.token
        );

        navigate(
          "/dashboard"
        );
      }
      catch (error) {
        console.error(error);

        alert(
          "Login failed"
        );
      }
    };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent:
          "center",
        alignItems: "center",
        padding: "24px"
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "48px"
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px"
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "12px"
            }}
          >
            🎩
          </div>

          <h1
            style={{
              fontSize: "42px",
              marginBottom: "8px"
            }}
          >
            MAFIA
          </h1>

          <p
            style={{
              color:
                "var(--text-secondary)"
            }}
          >
            Увійдіть до свого
            акаунта
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "16px"
          }}
        >
          <input
            className="text-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          <input
            className="text-input"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          <button
            className="primary-button"
            onClick={
              handleLogin
            }
          >
            Увійти
          </button>
        </div>
      </div>
    </div>
  );
}