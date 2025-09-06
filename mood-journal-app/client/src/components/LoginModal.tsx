import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { GoogleLogin } from "@react-oauth/google";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const queryClient = useQueryClient();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Google OAuth 응답 처리
  const handleGoogleCredentialResponse = async (
    response: GoogleCredentialResponse
  ) => {
    console.log("Google OAuth 응답 받음:", response);
    setIsGoogleLoading(true);
    try {
      const success = await login({
        provider: "google",
        accessToken: response.credential,
      });

      if (success) {
        // 로그인 성공 후 React Query 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ["diary-list"] });
        queryClient.invalidateQueries({ queryKey: ["diary"] });
        onClose();
      }
    } catch (error) {
      console.error("Google 로그인 실패:", error);
      alert("Google 로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGoogleLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
      <div className="p-8 mx-4 w-full max-w-md bg-white rounded-2xl shadow-xl dark:bg-gray-800">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            로그인
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            계정을 연결하여 개인 일기를 안전하게 관리하세요
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <GoogleLogin
              onSuccess={(credentialResponse: { credential?: string }) => {
                console.log("Google 로그인 성공:", credentialResponse);
                handleGoogleCredentialResponse({
                  credential: credentialResponse.credential!,
                  select_by: "user",
                });
              }}
              onError={() => {
                console.log("Google 로그인 실패");
                alert("Google 로그인에 실패했습니다. 다시 시도해주세요.");
              }}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
              width="100%"
            />
            {isGoogleLoading && (
              <div className="flex absolute inset-0 justify-center items-center bg-white bg-opacity-75 rounded-lg">
                <div className="font-medium text-blue-600">로그인 중...</div>
              </div>
            )}
          </div>

        </div>

        <div className="mt-6 text-center">
          <span
            onClick={onClose}
            className="text-gray-500 underline transition-colors cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            나중에 하기
          </span>
        </div>

        <div className="p-4 mt-6 bg-blue-50 rounded-lg dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            🔒 로그인하면 개인 일기가 안전하게 보호됩니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
