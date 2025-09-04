import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginCallback: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  React.useEffect(() => {
    (async () => {
      // 서버 세션 확인 후 원래 위치로 이동
      await checkAuth();
      const storedFrom = sessionStorage.getItem("post_login_from");
      sessionStorage.removeItem("post_login_from");
      const from = storedFrom || params.get("from") || "/";
      navigate(from, { replace: true });
    })();
  }, [checkAuth, navigate, params]);

  return null;
};

export default LoginCallback;
