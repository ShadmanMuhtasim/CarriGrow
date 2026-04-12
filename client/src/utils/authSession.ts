import type { User, UserRole } from "../types/models";

const AUTH_SESSION_KEY = "carrigrow_auth_session";
const LEGACY_TOKEN_KEY = "carrigrow_token";

export type SafeAuthSession = {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  status: User["status"];
  saved_at: string;
};

function isUserRole(value: unknown): value is UserRole {
  return value === "job_seeker" || value === "employer" || value === "mentor" || value === "admin";
}

function isUserStatus(value: unknown): value is User["status"] {
  return value === "active" || value === "banned";
}

export function buildSafeAuthSession(user: User): SafeAuthSession {
  return {
    user_id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    saved_at: new Date().toISOString(),
  };
}

export function persistSafeAuthSession(user: User) {
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(buildSafeAuthSession(user)));
}

export function readSafeAuthSession(): SafeAuthSession | null {
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<SafeAuthSession>;
    if (
      !parsed ||
      typeof parsed.user_id !== "number" ||
      !Number.isFinite(parsed.user_id) ||
      parsed.user_id <= 0 ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      !isUserRole(parsed.role) ||
      !isUserStatus(parsed.status) ||
      typeof parsed.saved_at !== "string"
    ) {
      return null;
    }

    return {
      user_id: parsed.user_id,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      status: parsed.status,
      saved_at: parsed.saved_at,
    };
  } catch {
    return null;
  }
}

export function hasSafeAuthSession() {
  return readSafeAuthSession() !== null;
}

export function clearSafeAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

export function clearLegacyTokenStorage() {
  window.sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_TOKEN_KEY);
}

