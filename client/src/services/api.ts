import axios from "axios";
import { secrets } from "../secrets";
import { clearLegacyTokenStorage, clearSafeAuthSession, hasSafeAuthSession } from "../utils/authSession";

export const api = axios.create({
  baseURL: secrets.apiBaseUrl,
  headers: { Accept: "application/json" },
  withCredentials: true,
});

function isPublicAuthRequest(url?: string) {
  if (!url) {
    return false;
  }

  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password")
  );
}

let didDispatchInvalidSession = false;

function dispatchInvalidSession(message: string) {
  if (didDispatchInvalidSession) {
    return;
  }

  didDispatchInvalidSession = true;
  clearSafeAuthSession();
  clearLegacyTokenStorage();

  window.dispatchEvent(
    new CustomEvent("carrigrow:auth-invalid", {
      detail: { message },
    })
  );

  window.setTimeout(() => {
    didDispatchInvalidSession = false;
  }, 1000);
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401 && !isPublicAuthRequest(url) && hasSafeAuthSession()) {
      const data = error.response?.data as { message?: string } | undefined;
      const message =
        typeof data?.message === "string" && data.message.trim() !== ""
          ? data.message
          : "Session expired. Please sign in again.";
      dispatchInvalidSession(message);
    }

    return Promise.reject(error);
  }
);
