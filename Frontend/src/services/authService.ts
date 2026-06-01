import { apiClient } from "../api/apiClient";

import type {
  LoginRequest,
  RegisterRequest,
} from "../types/Auth";

export async function login(
  request: LoginRequest
) {
  const response = await apiClient.post(
    "/auth/login",
    request
  );

  return response.data;
}

export async function register(
  request: RegisterRequest
) {
  const response = await apiClient.post(
    "/auth/register",
    request
  );

  return response.data;
}

// Google OAuth — отримати токен після редиректу з Google
export async function googleLogin(googleToken: string) {
  const response = await apiClient.post(
    "/auth/google",
    { token: googleToken }
  );

  return response.data;
}
// Перенаправити на Google OAuth
export function redirectToGoogleAuth() {
  window.location.href = "https://localhost:7000/api/auth/google";
}

// Обробити callback після Google OAuth
export function handleGoogleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const error = urlParams.get("error");

  if (error) {
    throw new Error(error);
  }

  if (!token) {
    throw new Error("No token received");
  }

  return token;
}