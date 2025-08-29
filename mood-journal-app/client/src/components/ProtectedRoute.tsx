import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { authState } = useAuth();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const token = search.get("token");
  const isDetailShare = location.pathname.startsWith("/detail/");

  if (authState.isLoading) return null;

  // 공유 링크로 접근 허용: 상세 페이지에서 토큰이 있을 때만 예외 허용
  if (!authState.isAuthenticated && !(isDetailShare && token)) {
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?from=${from}`} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
