import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import LoginModal from "./LoginModal";
import LoadingSpinner from "./LoadingSpinner";

const Header: React.FC = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    queryClient.clear();
    await logout();
    navigate("/");
  };

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

  const cookieName = (() => {
    const rawCookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("user_name="));
    if (!rawCookie) return null;
    const rawValue = rawCookie.slice("user_name=".length);
    return safeDecode(rawValue);
  })();

  const storedName = safeDecode(localStorage.getItem("user_name"));

  // 인증 상태와 쿠키 정보를 모두 확인하여 사용자 이름 결정
  const displayName = authState.user?.name || cookieName || storedName || "";

  // 모바일 환경에서 사용자 이름을 줄이는 함수
  const getDisplayName = (name: string) => {
    if (name.length > 4) {
      return name.substring(0, 4) + "...";
    }
    return name;
  };

  // 로딩 중일 때는 스피너 표시
  if (authState.isLoading) {
    return (
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 dark:border-gray-700 safe-top">
        <div className="flex justify-between items-center py-2 px-mobile">
          <div
            onClick={handleLogoClick}
            className="flex flex-shrink-0 items-center space-x-2 transition-opacity cursor-pointer hover:opacity-80"
          >
            <div className="flex justify-center items-center w-7 h-7 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg xs:w-8 xs:h-8">
              <span className="text-base font-bold text-white xs:text-lg">
                📝
              </span>
            </div>
            <span className="hidden font-bold text-gray-900 text-mobile-lg xs:text-mobile-xl dark:text-white xs:block">
              Mood Journal
            </span>
            <span className="font-bold text-gray-900 text-mobile-lg dark:text-white xs:hidden">
              MJ
            </span>
          </div>

          <div className="flex items-center space-x-2 min-w-0 xs:space-x-4">
            <LoadingSpinner size="sm" color="primary" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              확인 중...
            </span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 dark:border-gray-700 safe-top">
        <div className="flex justify-between items-center py-2 px-mobile">
          <div
            onClick={handleLogoClick}
            className="flex flex-shrink-0 items-center space-x-2 transition-opacity cursor-pointer hover:opacity-80"
          >
            <div className="flex justify-center items-center w-7 h-7 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg xs:w-8 xs:h-8">
              <span className="text-base font-bold text-white xs:text-lg">
                📝
              </span>
            </div>
            <span className="hidden font-bold text-gray-900 text-mobile-lg xs:text-mobile-xl dark:text-white xs:block">
              Mood Journal
            </span>
            <span className="font-bold text-gray-900 text-mobile-lg dark:text-white xs:hidden">
              MJ
            </span>
          </div>

          <div className="flex items-center space-x-2 min-w-0 xs:space-x-4">
            {authState.isAuthenticated ? (
              <div className="flex items-center space-x-1 min-w-0 xs:space-x-2">
                <span className="hidden text-gray-700 truncate text-mobile-xs xs:text-mobile-sm dark:text-gray-300 max-w-16 xs:max-w-none xs:block">
                  안녕하세요, {getDisplayName(displayName)}님! 👋
                </span>
                <span className="text-gray-700 text-mobile-xs dark:text-gray-300 xs:hidden">
                  {getDisplayName(displayName)}님 👋
                </span>
                <button
                  onClick={handleLogout}
                  className="flex-shrink-0 px-2 py-1 text-white bg-red-500 rounded-lg transition-colors text-mobile-xs xs:text-mobile-sm hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 touch-target"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex-shrink-0 px-2 py-1 text-white bg-blue-500 rounded-lg transition-colors text-mobile-xs xs:text-mobile-sm hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 touch-target"
              >
                🔒 로그인
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="header-mobile"></div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Header;
