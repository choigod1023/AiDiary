import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { authState } = useAuth();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  if (authState.isLoading) return null;
  // 공유 링크로 접근한 경우 인증 없이도 접근 허용
  if (!authState.isAuthenticated && !token) {
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?from=${from}`} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
