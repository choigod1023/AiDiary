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

  // 서버 세션 검증을 우선 사용. Safari 등 교차도메인에서는 JS로 서버 도메인 쿠키를 읽을 수 없음
  const checkAuth = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      // 1) 서버 검증 우선
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
        // ignore and try cookie fallback
      }

      // 2) 쿠키 fallback (동일 도메인에서만 유효)
      const getCookie = (name: string): string | null => {
        try {
          const value = document.cookie
            .split(";")
            .map((c) => c.trim())
            .find((c) => c.startsWith(`${name}=`));
          return value ? decodeURIComponent(value.split("=")[1]) : null;
        } catch {
          return null;
        }
      };

      const cookieUserName = getCookie("user_name");
      const cookieUserId = getCookie("user_id");

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
        return;
      }

      // 3) 모두 실패 시 비로그인 처리
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

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response =
        credentials.provider === "google"
          ? await authApi.googleLogin(credentials.accessToken)
          : await authApi.naverLogin(credentials.accessToken);

      if (response.success && response.user) {
        const user = response.user;
        // 로컬 저장소에 토큰 저장하여 모바일/쿠키 미포함 상황에서도 Authorization 헤더로 인증
        try {
          if (response.token)
            localStorage.setItem("auth_token", response.token);
        } catch {}

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
    try {
      localStorage.removeItem("auth_token");
    } catch {}
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
