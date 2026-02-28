import axios from "axios";
import { getToken } from "../utils/token";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});