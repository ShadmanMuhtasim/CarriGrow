import axios from "axios";
import { getToken } from "../utils/token";
import { secrets } from "../secrets";

export const api = axios.create({
  baseURL: secrets.apiBaseUrl,
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
