import { useState } from "react";
import { register } from "../services/authService";

export default function RegisterPage() {
  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleRegister = async () => {
    try {
      await register({
        username,
        email,
        password,
      });

      alert("Register success");
    }
    catch (error) {
      console.error(error);

      alert("Register failed");
    }
  };

  return (
    <div>
      <h1>Register</h1>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
      />

      <br />
      <br />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br />
      <br />

      <button onClick={handleRegister}>
        Register
      </button>
    </div>
  );
}