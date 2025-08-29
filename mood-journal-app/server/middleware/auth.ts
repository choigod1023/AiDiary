import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT 시크릿 키 (환경변수에서 가져오기)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Request 타입 확장
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    provider: string;
  };
}

// JWT 토큰 검증 미들웨어
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const cookieToken = (req as any).cookies?.token;
  const authHeader = req.headers["authorization"];
  const headerToken = authHeader && authHeader.split(" ")[1];
  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({
      error: "Access token required",
      message: "로그인이 필요합니다.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      provider: decoded.provider,
    };
    next();
  } catch (error) {
    return res.status(403).json({
      error: "Invalid token",
      message: "유효하지 않은 토큰입니다.",
    });
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없으면 통과)
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const cookieToken = (req as any).cookies?.token;
  const authHeader = req.headers["authorization"];
  const token = cookieToken || (authHeader && authHeader.split(" ")[1]);

  if (!token) {
    return next(); // 토큰이 없어도 통과
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      provider: decoded.provider,
    };
    next();
  } catch (error) {
    // 토큰이 유효하지 않아도 통과 (선택적 인증)
    next();
  }
};

// 사용자 ID 검증 미들웨어
export const validateUserOwnership = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "로그인이 필요합니다.",
    });
  }

  // URL 파라미터나 요청 본문에서 사용자 ID 확인
  const requestedUserId = req.params.userId || req.body.userId;

  if (requestedUserId && requestedUserId !== req.user.id) {
    return res.status(403).json({
      error: "Access denied",
      message: "자신의 데이터에만 접근할 수 있습니다.",
    });
  }

  next();
};

// 일기 소유자 확인 미들웨어
export const checkDiaryOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const diaryId = req.params.id;
    const userId = req.user?.id;

    // DiaryEntry 모델 import
    const { DiaryEntryModel } = await import("../models/DiaryEntry");

    const diary = await DiaryEntryModel.findById(diaryId);

    if (!diary) {
      return res.status(404).json({
        error: "Diary not found",
        message: "일기를 찾을 수 없습니다.",
      });
    }

    if (diary.userId !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message: "이 일기에 접근할 권한이 없습니다.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: "Ownership check failed",
      message: "권한 확인 중 오류가 발생했습니다.",
    });
  }
};

export default {
  authenticateToken,
  optionalAuth,
  validateUserOwnership,
  checkDiaryOwnership,
};
