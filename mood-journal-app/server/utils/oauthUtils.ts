import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

// 환경 변수 검증
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("Google OAuth 환경 변수가 설정되지 않았습니다!");
  console.error(
    "GOOGLE_CLIENT_ID:",
    process.env.GOOGLE_CLIENT_ID ? "설정됨" : "설정되지 않음"
  );
  console.error(
    "GOOGLE_CLIENT_SECRET:",
    process.env.GOOGLE_CLIENT_SECRET ? "설정됨" : "설정되지 않음"
  );
}

// Google OAuth 클라이언트 초기화
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

/**
 * Google OAuth 액세스 토큰을 검증하고 사용자 정보를 반환합니다.
 * @param accessToken Google OAuth 액세스 토큰
 * @returns Google 사용자 정보
 */
export async function verifyGoogleToken(accessToken: string) {
  try {
    // 환경 변수 확인
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_CLIENT_ID 환경 변수가 설정되지 않았습니다");
    }

    console.log("Google OAuth 토큰 검증 시작");
    console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
    console.log("Access Token 길이:", accessToken.length);
    console.log(
      "Access Token 타입:",
      accessToken.startsWith("ya29.") ? "Access Token" : "ID Token"
    );

    // Access Token인 경우 Google People API 사용
    if (accessToken.startsWith("ya29.")) {
      console.log("Access Token으로 Google People API 호출");

      try {
        // Google People API로 사용자 정보 가져오기
        const response = await axios.get(
          "https://people.googleapis.com/v1/people/me",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
            params: {
              personFields: "names,emailAddresses,photos",
            },
          }
        );

        const person = response.data;
        console.log("Google People API 응답:", person);

        if (!person.names || !person.emailAddresses) {
          throw new Error("사용자 정보를 가져올 수 없습니다");
        }

        return {
          id:
            person.resourceName?.replace("people/", "") ||
            person.emailAddresses[0]?.value,
          email: person.emailAddresses[0]?.value,
          name: person.names[0]?.displayName,
          picture: person.photos?.[0]?.url,
          verified: true, // Google 계정은 기본적으로 인증됨
        };
      } catch (peopleApiError) {
        console.error("Google People API 호출 실패:", peopleApiError);

        // People API 실패 시 Access Token을 ID Token으로 변환 시도
        console.log("Access Token을 ID Token으로 변환 시도");
        throw new Error(
          "Google People API 호출에 실패했습니다. 다른 방법을 시도해보세요."
        );
      }
    } else {
      // ID Token인 경우 기존 방식 사용
      console.log("ID Token으로 검증");
      const ticket = await googleClient.verifyIdToken({
        idToken: accessToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error("Invalid Google token payload");
      }

      console.log("Google OAuth 토큰 검증 성공:", {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      });

      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        verified: payload.email_verified,
      };
    }
  } catch (error) {
    console.error("Google token verification failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Google OAuth 토큰 검증 실패: ${errorMessage}`);
  }
}

/**
 * OAuth 제공자별 사용자 정보를 표준화된 형태로 변환합니다.
 * @param provider OAuth 제공자 (google)
 * @param userData OAuth 제공자로부터 받은 사용자 데이터
 * @returns 표준화된 사용자 정보
 */
export function normalizeOAuthUser(provider: string, userData: any) {
  return {
    provider,
    providerId: userData.id,
    email: userData.email,
    name: userData.name,
    avatar: userData.picture,
    verified: userData.verified,
  };
}
