import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { login, logout, me, refreshToken, register, type AuthPayload } from "../services/auth";
import {
  clearLegacyTokenStorage,
  clearSafeAuthSession,
  persistSafeAuthSession,
  readSafeAuthSession,
} from "../utils/authSession";
import type { User } from "../types/models";
import { toastUI } from "../components/ui/Toast";

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (payload: LoginInput) => Promise<User>;
  signUp: (payload: AuthPayload) => Promise<User>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toUserFromSnapshot(): User | null {
  const snapshot = readSafeAuthSession();
  if (!snapshot) {
    return null;
  }

  return {
    id: snapshot.user_id,
    name: snapshot.name,
    email: snapshot.email,
    role: snapshot.role,
    status: snapshot.status,
    skills: [],
    job_seeker_profile: null,
    employer_profile: null,
    mentor_profile: null,
    jobSeekerProfile: null,
    employerProfile: null,
    mentorProfile: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => toUserFromSnapshot());
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    clearSafeAuthSession();
    clearLegacyTokenStorage();
    setUserState(null);
  }, []);

  const updateUserState = useCallback((nextUser: User | null) => {
    setUserState(nextUser);
    if (nextUser) {
      persistSafeAuthSession(nextUser);
    } else {
      clearSafeAuthSession();
    }
  }, []);

  const bootstrapSession = useCallback(async () => {
    setIsLoading(true);
    clearLegacyTokenStorage();

    try {
      const response = await me();
      updateUserState(response.user);
    } catch {
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState, updateUserState]);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    function handleInvalidSession(event: Event) {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const message =
        typeof customEvent.detail?.message === "string" && customEvent.detail.message.trim() !== ""
          ? customEvent.detail.message
          : "Session expired. Please sign in again.";

      clearAuthState();
      setIsLoading(false);
      toastUI.error(message);

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    window.addEventListener("carrigrow:auth-invalid", handleInvalidSession as EventListener);
    return () => {
      window.removeEventListener("carrigrow:auth-invalid", handleInvalidSession as EventListener);
    };
  }, [clearAuthState]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    async function validateSession() {
      try {
        const response = await me();
        if (!cancelled) {
          updateUserState(response.user);
        }
      } catch {
        // 401/invalid token is handled centrally by the API response interceptor.
      }
    }

    function onFocusOrVisible() {
      if (document.visibilityState === "visible") {
        void validateSession();
      }
    }

    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
  }, [user, updateUserState]);

  async function signIn(payload: LoginInput) {
    clearAuthState();
    const response = await login(payload);
    updateUserState(response.user);
    return response.user;
  }

  async function signUp(payload: AuthPayload) {
    clearAuthState();
    const response = await register(payload);
    updateUserState(response.user);
    return response.user;
  }

  async function signOut() {
    try {
      await logout();
    } finally {
      clearAuthState();
    }
  }

  async function refreshSession() {
    const response = await refreshToken();
    updateUserState(response.user);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshSession,
      setUser: updateUserState,
    }),
    [isLoading, user, updateUserState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

