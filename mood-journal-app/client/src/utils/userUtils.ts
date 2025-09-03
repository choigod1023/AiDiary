// 사용자 이름을 안전하게 디코딩하는 함수
const safeDecode = (value: string | null): string | null => {
  if (!value) return null;

  try {
    // 먼저 URL 디코딩 시도
    let decoded = decodeURIComponent(value);

    // 만약 여전히 인코딩된 문자가 있다면 한 번 더 디코딩
    if (/%[0-9A-Fa-f]{2}/.test(decoded)) {
      try {
        decoded = decodeURIComponent(decoded);
      } catch {
        // 두 번째 디코딩 실패 시 첫 번째 결과 사용
      }
    }

    return decoded;
  } catch {
    // 디코딩 실패 시 원본 값 반환
    return value;
  }
};

// 사용자 이름을 가져오는 함수 (Header와 동일한 로직)
export const getUserDisplayName = (
  authState: { user?: { name?: string } | null } | null
): string => {
  // 1. AuthState에서 사용자 이름 확인
  if (authState?.user?.name) {
    return authState.user.name;
  }

  // 2. 쿠키에서 사용자 이름 확인
  const cookieName = (() => {
    try {
      const rawCookie = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("user_name="));
      if (!rawCookie) return null;
      const rawValue = rawCookie.slice("user_name=".length);
      const decoded = safeDecode(rawValue);
      return decoded;
    } catch {
      return null;
    }
  })();

  if (cookieName) {
    return cookieName;
  }

  // 3. localStorage에서 사용자 이름 확인
  const storedName = (() => {
    try {
      return safeDecode(localStorage.getItem("user_name"));
    } catch {
      return null;
    }
  })();
  if (storedName) {
    return storedName;
  }

  // 4. 모든 방법 실패 시 기본값
  return "익명";
};
