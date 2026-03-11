const KEY = "carrigrow_token";

export function getToken(): string | null {
  return sessionStorage.getItem(KEY);
}

export function setToken(token: string) {
  sessionStorage.setItem(KEY, token);
}

export function removeToken() {
  sessionStorage.removeItem(KEY);
}
