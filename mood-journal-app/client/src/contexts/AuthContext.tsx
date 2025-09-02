import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthState, LoginCredentials } from "../types/auth";
import { authApi } from "../utils/api";

interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { useAuth };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 쿠키 기반 인증으로 변경했으므로 localStorage 감지 제거

  const checkAuth = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      // 간단한 쿠키 조회 함수 (성능 최적화)
      const getCookie = (name: string): string | null => {
        try {
          const value = document.cookie
            .split(";")
            .map((c) => c.trim())
            .find((c) => c.startsWith(`${name}=`));

          if (value) {
            return decodeURIComponent(value.split("=")[1]);
          }
          return null;
        } catch {
          return null;
        }
      };

      // 쿠키에서 사용자 정보 확인
      const cookieUserName = getCookie("user_name");
      const cookieUserId = getCookie("user_id");

      // 쿠키에서 사용자 정보가 있으면 즉시 인증된 상태로 처리
      if (cookieUserName && cookieUserId) {
        const user: User = {
          id: cookieUserId,
          email: getCookie("user_email") || "cookie@example.com",
          name: cookieUserName,
          avatar: getCookie("user_avatar") || undefined,
          provider:
            (getCookie("user_provider") as "google" | "naver") || "google",
          createdAt: new Date().toISOString(),
        };

        setAuthState({
          user,
          token: null,
          isAuthenticated: true,
          isLoading: false,
        });
        return; // 쿠키 정보가 있으면 서버 검증 건너뛰기
      }

      // 쿠키에 사용자 정보가 없을 때만 서버 검증 시도
      // 이때는 로딩 상태를 유지하여 사용자에게 피드백 제공
      try {
        const verified = await authApi.verifyToken();

        if (verified.success) {
          const user = await authApi.getProfile();
          setAuthState({
            user,
            token: null,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch {
        // 서버 검증 실패 시 조용히 처리
      }

      // 인증되지 않은 상태로 설정
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // 쿠키 기반 인증으로 변경했으므로 localStorage 백업 제거

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response =
        credentials.provider === "google"
          ? await authApi.googleLogin(credentials.accessToken)
          : await authApi.naverLogin(credentials.accessToken);

      if (response.success && response.user) {
        const user = response.user;

        console.log("Login - server response:", {
          originalName: user.name,
          originalEmail: user.email,
          id: user.id,
          provider: user.provider,
          hasToken: !!response.token,
        });

        setAuthState({
          user,
          token: response.token || null,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      throw new Error("Login failed");
    } catch {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = async () => {
    await authApi.logout().catch(() => undefined);
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (user: User) =>
    setAuthState((prev) => ({ ...prev, user }));

  const value: AuthContextType = {
    authState,
    login,
    logout,
    checkAuth,
    updateUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
