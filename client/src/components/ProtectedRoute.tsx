import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getToken } from "../utils/token";
import Loading from "./Loading";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const hasStoredToken = Boolean(getToken());

  if (isLoading) {
    return <Loading label="Checking session..." fullPage />;
  }

  if (!isAuthenticated && !hasStoredToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
