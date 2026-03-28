import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "./Loading";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading label="Checking session..." fullPage />;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
