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

  const checkAuth = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      console.log("Checking auth...", { userAgent: navigator.userAgent });

      // 로컬 스토리지에서 토큰 확인
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No token found in localStorage");
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const verified = await authApi.verifyToken();
      console.log("Auth verification result:", verified);

      if (verified.success) {
        // 프로필 별도 조회 + 표시용 정보 캐시
        const user = await authApi.getProfile();
        console.log("User profile loaded:", user);

        try {
          localStorage.setItem("user_name", user.name || "");
          if (user.avatar) localStorage.setItem("user_avatar", user.avatar);
        } catch (error) {
          console.warn("Failed to save user info to localStorage:", error);
        }
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        console.log("Auth verification failed");
        // 토큰이 유효하지 않으면 제거
        localStorage.removeItem("auth_token");
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // 에러 발생 시 토큰 제거
      localStorage.removeItem("auth_token");
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
        try {
          localStorage.setItem("user_name", user.name || "");
          if (user.avatar) localStorage.setItem("user_avatar", user.avatar);
          // 서버에서 받은 토큰을 로컬 스토리지에 저장
          if (response.token) {
            localStorage.setItem("auth_token", response.token);
          }
        } catch (error) {
          console.warn("Failed to save user info to localStorage:", error);
        }
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
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_avatar");
      localStorage.removeItem("auth_token");
    } catch (error) {
      console.warn("Failed to remove user info from localStorage:", error);
    }
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
