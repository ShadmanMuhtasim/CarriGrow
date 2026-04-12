import { api } from "./api";
import type { User } from "../types/models";

export type AuthPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
};

export type AuthResponse = {
  message: string;
  user: User;
  expires_in: number;
};

export async function login(payload: { email: string; password: string }): Promise<AuthResponse> {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function register(payload: AuthPayload): Promise<AuthResponse> {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function me(): Promise<{ user: User }> {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function refreshToken(): Promise<AuthResponse> {
  const { data } = await api.post("/auth/refresh");
  return data;
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export type ResetPasswordPayload = {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  const { data } = await api.post("/auth/reset-password", payload);
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}
