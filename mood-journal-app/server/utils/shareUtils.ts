import crypto from "crypto";

/**
 * 공유 토큰 생성
 * @returns 고유한 공유 토큰
 */
export const generateShareToken = (): string => {
  return crypto.randomBytes(16).toString("hex");
};

/**
 * 공유 링크 생성
 * @param token 공유 토큰
 * @param baseUrl 기본 URL
 * @returns 공유 가능한 링크
 */
export const generateShareLink = (token: string, baseUrl: string): string => {
  return `${baseUrl}/shared/${token}`;
};

/**
 * 공유 토큰 유효성 검사
 * @param token 검사할 토큰
 * @returns 유효한 토큰인지 여부
 */
export const validateShareToken = (token: string): boolean => {
  // 32자리 16진수 문자열인지 확인
  return /^[a-f0-9]{32}$/.test(token);
};
