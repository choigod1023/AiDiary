export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "google" | "naver";
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  provider: "google" | "naver";
  accessToken: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message: string;
}
