const KEY = "carrigrow_token";

export function getToken(): string | null {
  return null;
}

export function setToken() {
  // Deprecated: JWT is now transported via HttpOnly cookie.
}

export function removeToken() {
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(KEY);
}
