const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_ENDPOINT ||
  "/api";

const normalizedApiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");

export const secrets = {
  apiBaseUrl:
    normalizedApiBaseUrl === "" || normalizedApiBaseUrl === "/"
      ? "/api"
      : normalizedApiBaseUrl.endsWith("/api")
        ? normalizedApiBaseUrl
        : `${normalizedApiBaseUrl}/api`,
};
