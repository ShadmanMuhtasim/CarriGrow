import { api } from "./api";
import { removeToken } from "../utils/token";

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
}) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    removeToken();
  }
}