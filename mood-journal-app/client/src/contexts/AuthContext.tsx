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
      console.log("Checking auth...", { userAgent: navigator.userAgent });

      // 안전한 디코딩 함수 (쿠키에서 사용)
      const safeDecode = (value: string | null): string | null => {
        if (!value) return null;
        const replaced = value.replace(/\+/g, " ");
        try {
          const once = decodeURIComponent(replaced);
          if (/%[0-9A-Fa-f]{2}/.test(once)) {
            try {
              return decodeURIComponent(once);
            } catch {
              return once;
            }
          }
          return once;
        } catch {
          return replaced;
        }
      };

      // 쿠키에서 사용자 정보 가져오기 (개선된 버전)
      const getCookie = (name: string): string | null => {
        try {
          // 모든 쿠키를 로그로 확인
          console.log(`Getting cookie: ${name}`);
          console.log(`All cookies: ${document.cookie}`);

          const value = document.cookie
            .split(";")
            .map((c) => c.trim())
            .find((c) => c.startsWith(`${name}=`));

          if (value) {
            const decodedValue = safeDecode(value.split("=")[1]);
            console.log(`Found cookie ${name}:`, decodedValue);
            return decodedValue;
          }

          console.log(`Cookie ${name} not found`);
          return null;
        } catch (error) {
          console.warn(`Failed to get cookie ${name}:`, error);
          return null;
        }
      };

      // 쿠키에서 사용자 정보 확인
      const cookieUserName = getCookie("user_name");
      const cookieUserEmail = getCookie("user_email");
      const cookieUserId = getCookie("user_id");
      const cookieUserProvider = getCookie("user_provider");
      const cookieUserAvatar = getCookie("user_avatar");

      console.log("Auth check - cookie data:", {
        userName: cookieUserName,
        userEmail: cookieUserEmail,
        userId: cookieUserId,
        userProvider: cookieUserProvider,
        userAvatar: cookieUserAvatar,
        userAgent: navigator.userAgent,
        location: window.location.href,
      });

      // 쿠키에서 사용자 정보가 있으면 인증된 상태로 처리
      if (cookieUserName && cookieUserId) {
        console.log("Using cookie user info for authentication");

        const user: User = {
          id: cookieUserId,
          email: cookieUserEmail || "cookie@example.com",
          name: cookieUserName,
          avatar: cookieUserAvatar || undefined,
          provider: (cookieUserProvider as "google" | "naver") || "google",
          createdAt: new Date().toISOString(),
        };

        console.log("Cookie user data:", {
          name: cookieUserName,
          email: cookieUserEmail,
          id: cookieUserId,
          provider: cookieUserProvider,
          avatar: cookieUserAvatar,
        });

        setAuthState({
          user,
          token: null, // 쿠키 기반이므로 토큰은 null
          isAuthenticated: true,
          isLoading: false,
        });
        return; // 쿠키 정보가 있으면 서버 검증 건너뛰기
      } else {
        console.log("No cookie user info found, trying server verification");

        // 쿠키에 사용자 정보가 없으면 서버 검증 시도
        try {
          const verified = await authApi.verifyToken();
          console.log("Auth verification result:", verified);

          if (verified.success) {
            // 프로필 별도 조회
            const user = await authApi.getProfile();
            console.log("User profile loaded from server:", user);

            setAuthState({
              user,
              token: null,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          } else {
            console.log("Auth verification failed - no valid session");
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Token verification error:", error);
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
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
