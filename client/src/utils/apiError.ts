import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[] | string> }
      | undefined;

    if (data?.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      const value = firstKey ? data.errors[firstKey] : undefined;
      if (Array.isArray(value) && value.length > 0) {
        return value[0];
      }
      if (typeof value === "string" && value.trim() !== "") {
        return value;
      }
    }

    if (typeof data?.message === "string" && data.message.trim() !== "") {
      return data.message;
    }
  }

  return fallback;
}
