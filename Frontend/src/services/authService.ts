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