import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthState, LoginCredentials } from "../types/auth";
import { StorageManager } from "../utils/storage";
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, []);

  // 인증 상태 확인
  const checkAuth = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      // 로컬에서 토큰과 사용자 정보 확인
      const token = await StorageManager.get("auth_token");
      const user = await StorageManager.get("user_data");

      if (token && user) {
        // 토큰 유효성 검증 (서버에 요청)
        const isValid = await validateToken();

        if (isValid) {
          setAuthState({
            user: user as User,
            token: token as string,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // 토큰이 유효하지 않으면 로그아웃
          await logout();
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  // 토큰 유효성 검증
  const validateToken = async (): Promise<boolean> => {
    try {
      const response = await authApi.verifyToken();
      return response.success;
    } catch (error) {
      console.error("Token validation failed:", error);
      // 토큰이 유효하지 않으면 자동으로 로그아웃
      await logout();
      return false;
    }
  };

  // 로그인
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      let response;

      // 제공자별 로그인 API 호출
      if (credentials.provider === "google") {
        response = await authApi.googleLogin(credentials.accessToken);
      } else if (credentials.provider === "naver") {
        response = await authApi.naverLogin(credentials.accessToken);
      } else {
        throw new Error(`Unsupported provider: ${credentials.provider}`);
      }

      if (response.success) {
        // 로컬에 저장
        await StorageManager.set("auth_token", response.token);
        await StorageManager.set("user_data", response.user);

        setAuthState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        });

        return true;
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      // 로컬 데이터 정리
      await StorageManager.remove("auth_token");
      await StorageManager.remove("user_data");

      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // 사용자 정보 업데이트
  const updateUser = (user: User) => {
    setAuthState((prev) => ({ ...prev, user }));
    StorageManager.set("user_data", user);
  };

  const value: AuthContextType = {
    authState,
    login,
    logout,
    checkAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
