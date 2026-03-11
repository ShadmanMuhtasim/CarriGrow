import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { login, logout, me, refreshToken, register, type AuthPayload } from "../services/auth";
import { getToken, removeToken, setToken } from "../utils/token";
import type { User } from "../types/models";

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (payload: LoginInput) => Promise<User>;
  signUp: (payload: AuthPayload) => Promise<User>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Fresh login/register already sets user in-memory.
      // Only hydrate from /auth/me when app bootstraps from a stored token.
      if (user) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setIsLoading(true);
      }

      try {
        const response = await me();
        if (!cancelled) {
          setUser(response.user);
        }
      } catch {
        removeToken();
        if (!cancelled) {
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [token, user]);

  async function signIn(payload: LoginInput) {
    // Always clear stale session before a fresh login attempt.
    removeToken();
    setTokenState(null);
    setUser(null);

    const response = await login(payload);
    setUser(response.user);
    setToken(response.access_token);
    setTokenState(response.access_token);
    return response.user;
  }

  async function signUp(payload: AuthPayload) {
    // Ensure registration creates a fresh JWT session.
    removeToken();
    setTokenState(null);
    setUser(null);

    const response = await register(payload);
    setUser(response.user);
    setToken(response.access_token);
    setTokenState(response.access_token);
    return response.user;
  }

  async function signOut() {
    await logout();
    removeToken();
    setTokenState(null);
    setUser(null);
  }

  async function refreshSession() {
    const response = await refreshToken();
    setToken(response.access_token);
    setTokenState(response.access_token);
    setUser(response.user);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshSession,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
