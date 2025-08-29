import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import LoginModal from "./LoginModal";

const Header: React.FC = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    // React Query 캐시 초기화
    queryClient.clear();

    // 로그아웃 처리
    await logout();

    // 홈으로 이동
    navigate("/");
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 dark:border-gray-700 mobile-safe-top">
        <div className="flex justify-between items-center px-6 py-3">
          {/* 로고 및 프로젝트 이름 */}
          <div
            onClick={handleLogoClick}
            className="flex items-center space-x-2 transition-opacity cursor-pointer hover:opacity-80"
          >
            <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg">
              <span className="text-lg font-bold text-white">📝</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Mood Journal
            </span>
          </div>

          {/* 인증 상태 및 로그인/로그아웃 */}
          <div className="flex items-center space-x-4">
            {authState.isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  안녕하세요,{" "}
                  {authState.user?.name ||
                    localStorage.getItem("user_name") ||
                    ((): string | null => {
                      const raw = document.cookie
                        .split(";")
                        .map((c) => c.trim())
                        .find((c) => c.startsWith("display_name="))
                        ?.split("=")[1];
                      return raw ? decodeURIComponent(raw) : null;
                    })() ||
                    "사용자"}
                  님! 👋
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm text-white bg-red-500 rounded-lg transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-2 text-sm text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                🔒 로그인
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 헤더 높이 + 안전 영역만큼 상단 여백 추가 */}
      <div className="mobile-header-height"></div>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Header;
